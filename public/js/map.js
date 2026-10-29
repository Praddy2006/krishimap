// KrishiMap map page logic.
//
// Uses the free, no-key MapLibre demo style as a starting basemap.
// The physical map toggle uses OpenTopoMap — free, open, no API key.
// Hovering a state shows a quick tooltip that follows the cursor;
// clicking a state opens the full report in the side panel.
// Clicking Maharashtra drills down into its districts, coloured by main crop.

const MAP_STYLE = 'https://demotiles.maplibre.org/style.json';
const GEOJSON_URL = 'data/india_states.geojson';

// ---- NEW: district drill-down settings ----
const DISTRICT_GEOJSON_URL = 'data/maharashtra_districts.geojson';
const DISTRICT_CROPS_URL = 'data/maharashtra_district_crops.json';
// The code tries these property names in order and uses the first one found
// in your GeoJSON. Add yours here if none of them match.
const DISTRICT_NAME_PROPS = ['district', 'DISTRICT', 'NAME_2', 'dtname', 'Dist_Name', 'shapeName', 'name'];

// Old district names -> current names used in the crops JSON.
const DISTRICT_ALIASES = {
  'ahmadnagar': 'ahilyanagar',
  'ahmednagar': 'ahilyanagar',
  'aurangabad': 'chhatrapati sambhajinagar',
  'osmanabad': 'dharashiv',
  'greater bombay': 'mumbai city',
  'mumbai': 'mumbai city',
  'bombay': 'mumbai city',
  'raigarh': 'raigad',
  'buldana': 'buldhana',
  'gondiya': 'gondia',
  'bid': 'beed',
  'garhchiroli': 'gadchiroli'
};

// Colour per main crop. Add more as your data grows.
const CROP_COLORS = {
  'Sugarcane': '#4caf50',
  'Cotton': '#e8e4d0',
  'Grapes': '#8e44ad',
  'Oranges': '#f39c12',
  'Banana': '#f1c40f',
  'Jowar': '#c68b59',
  'Rice': '#2ecc71',
  'Soybean': '#a1887f',
  'Onion': '#c0392b',
  'Pomegranate': '#e74c3c',
  'Tur': '#d4ac0d',
  'Mango': '#ff9f43',
  'Bajra': '#b9770e',
  'Groundnut': '#a04000',
  'Turmeric': '#e67e22',
  'Wheat': '#f5cba7'
};
const DEFAULT_CROP_COLOR = '#90a4ae';

let map;
let selectedStateId = null;
let inDistrictView = false;
let selectedDistrictId = null;
let districtRecords = [];   // every district from the crops file, used for the full PDF
let currentDistrict = null; // the district shown in the panel
const stateDataCache = {}; // avoids re-fetching the same state on every hover

// ---- 1. Require login before showing the map ----
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.href = 'login.html';
      return null;
    }
    const data = await res.json();
    document.getElementById('userLabel').textContent = `Hi, ${data.name}`;
    return data;
  } catch (err) {
    window.location.href = 'login.html';
    return null;
  }
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = 'login.html';
});

// NEW: back button for the district view
document.getElementById('backToIndia').addEventListener('click', () => exitDistrictView());

// ---- 2. Initialize the map once auth passes ----
async function initMap() {
  const authed = await checkAuth();
  if (!authed) return;

  map = new maplibregl.Map({
    container: 'map',
    style: MAP_STYLE,
    center: [80.5, 22.5],
    zoom: 3.6,
    pitch: 0,
    maxBounds: [
      [60, 2],
      [104, 40]
    ]
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-left');

  map.on('load', () => {
    map.addSource('physical-terrain', {
      type: 'raster',
      tiles: [
        'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
        'https://c.tile.opentopomap.org/{z}/{x}/{y}.png'
      ],
      tileSize: 256,
      attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    });
    map.addLayer({
      id: 'physical-terrain-layer',
      type: 'raster',
      source: 'physical-terrain',
      layout: { visibility: 'none' },
      paint: { 'raster-opacity': 1 }
    });

    map.addSource('india-states', {
      type: 'geojson',
      data: GEOJSON_URL,
      generateId: true
    });

    map.addLayer({
      id: 'states-fill',
      type: 'fill',
      source: 'india-states',
      paint: {
        'fill-color': '#7cb87a',
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 0.75,
          ['boolean', ['feature-state', 'hover'], false], 0.55,
          0.25
        ]
      }
    });

    map.addLayer({
      id: 'states-outline',
      type: 'line',
      source: 'india-states',
      paint: {
        'line-color': '#d9a441',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 2.5,
          1
        ]
      }
    });

    // NEW: load district layers (failure is caught inside, states keep working)
    loadDistrictLayers().then(setupDistrictInteractions);

    setupInteractions();
    setupTerrainToggle();
  });
}

// ---- 3. Hover tooltip + click-to-open-panel behavior ----
function setupInteractions() {
  let hoveredId = null;
  let hoveredName = null;
  const tooltip = document.getElementById('stateTooltip');

  map.on('mousemove', 'states-fill', (e) => {
    if (e.features.length === 0) return;
    const feature = e.features[0];

    if (hoveredId !== null && hoveredId !== feature.id) {
      map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
    }
    hoveredId = feature.id;
    map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: true });
    map.getCanvas().style.cursor = 'pointer';

    const name = feature.properties.name;

    // Only re-fetch/rebuild the tooltip content when we've moved to a
    // genuinely different state — not on every pixel of mouse movement.
    if (name !== hoveredName) {
      hoveredName = name;
      showTooltipFor(name, tooltip);
    }

    positionTooltip(e.originalEvent, tooltip);
  });

  map.on('mouseleave', 'states-fill', () => {
    if (hoveredId !== null) {
      map.setFeatureState({ source: 'india-states', id: hoveredId }, { hover: false });
    }
    hoveredId = null;
    hoveredName = null;
    map.getCanvas().style.cursor = '';
    tooltip.classList.remove('visible');
  });

  map.on('click', 'states-fill', (e) => {
    if (e.features.length === 0) return;
    const feature = e.features[0];

    if (selectedStateId !== null) {
      map.setFeatureState({ source: 'india-states', id: selectedStateId }, { selected: false });
    }
    selectedStateId = feature.id;
    map.setFeatureState({ source: 'india-states', id: selectedStateId }, { selected: true });

    loadStateReport(feature.properties.name);
    recordVisit(feature.properties.name);

    const bounds = getFeatureBounds(feature);
    if (bounds) {
      map.fitBounds(bounds, { padding: 60, duration: 900, maxZoom: 6.5 });
    }

    // NEW: Maharashtra drills down into districts
    if (feature.properties.name === 'Maharashtra') {
      enterDistrictView();
    }
  });
}

function positionTooltip(originalEvent, tooltip) {
  const offsetX = 16;
  const offsetY = 16;
  let left = originalEvent.clientX + offsetX;
  let top = originalEvent.clientY + offsetY;

  // keep it on-screen near the right/bottom edges
  const maxLeft = window.innerWidth - 240;
  const maxTop = window.innerHeight - 140;
  if (left > maxLeft) left = originalEvent.clientX - 220 - offsetX;
  if (top > maxTop) top = originalEvent.clientY - 120 - offsetY;

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

async function showTooltipFor(stateName, tooltip) {
  tooltip.classList.add('visible');
  tooltip.innerHTML = `<div class="tt-name">${stateName}</div><div class="tt-row">Loading...</div>`;

  if (stateDataCache[stateName]) {
    renderTooltip(stateDataCache[stateName], stateName, tooltip);
    return;
  }

  try {
    const res = await fetch(`/api/states/${encodeURIComponent(stateName)}`);
    const data = await res.json();
    if (res.ok) {
      stateDataCache[stateName] = data;
      renderTooltip(data, stateName, tooltip);
    } else {
      tooltip.innerHTML = `<div class="tt-name">${stateName}</div><div class="tt-row">No data yet</div>`;
    }
  } catch (err) {
    tooltip.innerHTML = `<div class="tt-name">${stateName}</div><div class="tt-row">Could not load</div>`;
  }
}

function renderTooltip(data, stateName, tooltip) {
  tooltip.innerHTML = `
    <div class="tt-name">${data.name || stateName}</div>
    <div class="tt-row">Soil: <span>${data.soil_type || '—'}</span></div>
    <div class="tt-row">Crops: <span>${data.major_crops || '—'}</span></div>
    <div class="tt-hint">Click for full report</div>
  `;
}

function getFeatureBounds(feature) {
  try {
    const coords = [];
    const geom = feature.geometry;
    const collect = (arr, depth) => {
      if (depth === 0) { coords.push(arr); return; }
      arr.forEach(a => collect(a, depth - 1));
    };
    const depth = geom.type === 'Polygon' ? 2 : geom.type === 'MultiPolygon' ? 3 : 0;
    if (depth === 0) return null;
    collect(geom.coordinates, depth);

    let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
    coords.forEach(([lng, lat]) => {
      minLng = Math.min(minLng, lng); maxLng = Math.max(maxLng, lng);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    });
    return [[minLng, minLat], [maxLng, maxLat]];
  } catch (err) {
    return null;
  }
}

function recordVisit(stateName) {
  // fire-and-forget — don't block the UI on this
  fetch(`/api/states/${encodeURIComponent(stateName)}/visit`, { method: 'POST' })
    .catch(err => console.error('Could not record visit:', err));
}

// ---- 4. Full report, shown on click ----
async function loadStateReport(stateName) {
  const panel = document.getElementById('panel');
  const body = document.getElementById('panelBody');
  panel.classList.add('open');
  body.innerHTML = `<p class="empty">Loading ${stateName}...</p>`;

  try {
    const res = await fetch(`/api/states/${encodeURIComponent(stateName)}`);
    const data = await res.json();

    if (!res.ok) {
      body.innerHTML = `
        <div class="eyebrow">State profile</div>
        <h2>${stateName}</h2>
        <p class="empty">${data.error || 'No data available for this state yet.'}</p>
      `;
      return;
    }

    body.innerHTML = `
      <div class="eyebrow">State profile</div>
      <h2>${data.name}</h2>
      <div class="field"><div class="k">Soil Type</div><div class="v">${data.soil_type || '—'}</div></div>
      <div class="field"><div class="k">Major Crops</div><div class="v">${data.major_crops || '—'}</div></div>
      <div class="field"><div class="k">Climate</div><div class="v">${data.climate || '—'}</div></div>
      <div class="field"><div class="k">Farming Notes</div><div class="v">${data.farming_notes || '—'}</div></div>
      <a class="download-btn" href="/api/states/${encodeURIComponent(data.name)}/report">Download PDF report</a>
    `;
  } catch (err) {
    body.innerHTML = `<p class="empty">Could not reach the server. Please try again.</p>`;
  }
}

function closePanel() {
  document.getElementById('panel').classList.remove('open');
}
window.closePanel = closePanel;

// ---- 5. Physical/political map toggle ----
const BASE_LAYERS_TO_HIDE = [
  'background', 'coastline', 'countries-fill',
  'countries-boundary', 'geolines', 'geolines-label',
  'countries-label', 'crimea-fill'
];

function setupTerrainToggle() {
  const btn = document.getElementById('terrainToggle');
  let physicalOn = false;

  btn.addEventListener('click', () => {
    physicalOn = !physicalOn;

    map.setLayoutProperty(
      'physical-terrain-layer', 'visibility',
      physicalOn ? 'visible' : 'none'
    );
    BASE_LAYERS_TO_HIDE.forEach(id => {
      if (map.getLayer(id)) {
        map.setLayoutProperty(id, 'visibility', physicalOn ? 'none' : 'visible');
      }
    });

    btn.textContent = physicalOn ? 'Show political map' : 'Show physical map';
    btn.classList.toggle('active', physicalOn);
  });
}

// ---- 6. NEW: Maharashtra district drill-down ----
function normName(s) {
  return String(s || '').toLowerCase().replace(/[^a-z ]/g, '').replace(/\s+/g, ' ').trim();
}

// Turns one entry of the crops JSON into a flat record.
// Arrays are joined into strings because MapLibre stringifies nested values.
function toRecord(name, info) {
  const j = v => Array.isArray(v) ? v.join(', ') : (v || '');
  return {
    district_name: name,
    primary_crop: info.primary_crop || 'Unknown',
    crops: j(info.crops),
    notes: info.notes || '',
    region: info.region || '',
    soil: info.soil || '',
    rainfall: info.rainfall || '',
    irrigation: info.irrigation || '',
    kharif: j(info.kharif),
    rabi: j(info.rabi),
    horticulture: j(info.horticulture),
    special: info.special || '',
    challenges: info.challenges || ''
  };
}

async function loadDistrictLayers() {
  try {
    const [geoRes, cropsRes] = await Promise.all([
      fetch(DISTRICT_GEOJSON_URL),
      fetch(DISTRICT_CROPS_URL)
    ]);
    if (!geoRes.ok) throw new Error('District GeoJSON not found: ' + DISTRICT_GEOJSON_URL);
    const geo = await geoRes.json();
    let crops = {};
    if (cropsRes.ok) {
      crops = await cropsRes.json();
    } else {
      console.warn('Crops file not found (' + DISTRICT_CROPS_URL + '). Districts will show as grey.');
    }

    // Index crop data by normalised name so spelling/case differences don't matter
    const cropIndex = {};
    Object.entries(crops).forEach(([k, v]) => { cropIndex[normName(k)] = v; });

    // Find which property in the GeoJSON holds the district name
    const sample = geo.features[0] ? geo.features[0].properties : {};
    const nameProp = DISTRICT_NAME_PROPS.find(p => p in sample);
    if (!nameProp) {
      console.error('No district name property found. Properties available:', Object.keys(sample));
    }

    geo.features.forEach(f => {
      const name = f.properties[nameProp] || 'Unknown';
      const key = normName(name);
      const info = cropIndex[key] || cropIndex[DISTRICT_ALIASES[key]] || {};
      if (!info.primary_crop) console.warn('No crop data for district:', name);
      Object.assign(f.properties, toRecord(name, info));
    });

    // Full list of records (all districts in the crops file) for the "all districts" PDF
    districtRecords = Object.entries(crops).map(([n, info]) => toRecord(n, info));

    // ['match', ['get','primary_crop'], 'Grapes', '#..', ..., default]
    const colorExpr = ['match', ['get', 'primary_crop']];
    Object.entries(CROP_COLORS).forEach(([crop, color]) => colorExpr.push(crop, color));
    colorExpr.push(DEFAULT_CROP_COLOR);

    map.addSource('mh-districts', { type: 'geojson', data: geo, generateId: true });

    map.addLayer({
      id: 'districts-fill',
      type: 'fill',
      source: 'mh-districts',
      layout: { visibility: 'none' },
      paint: {
        'fill-color': colorExpr,
        'fill-opacity': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 0.9,
          ['boolean', ['feature-state', 'hover'], false], 0.8,
          0.6
        ]
      }
    });

    map.addLayer({
      id: 'districts-outline',
      type: 'line',
      source: 'mh-districts',
      layout: { visibility: 'none' },
      paint: {
        'line-color': '#ffffff',
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'selected'], false], 2.5,
          1
        ]
      }
    });
  } catch (err) {
    console.error('Could not load district data:', err);
  }
}

function setupDistrictInteractions() {
  if (!map.getLayer('districts-fill')) return;
  let hoveredId = null;
  const tooltip = document.getElementById('stateTooltip');

  map.on('mousemove', 'districts-fill', (e) => {
    if (!e.features.length) return;
    const f = e.features[0];
    if (hoveredId !== null && hoveredId !== f.id) {
      map.setFeatureState({ source: 'mh-districts', id: hoveredId }, { hover: false });
    }
    hoveredId = f.id;
    map.setFeatureState({ source: 'mh-districts', id: hoveredId }, { hover: true });
    map.getCanvas().style.cursor = 'pointer';

    tooltip.classList.add('visible');
    tooltip.innerHTML = `
      <div class="tt-name">${f.properties.district_name}</div>
      <div class="tt-row">Region: <span>${f.properties.region || '—'}</span></div>
      <div class="tt-row">Main crop: <span>${f.properties.primary_crop}</span></div>
      <div class="tt-row">Soil: <span>${(f.properties.soil || '—').split(';')[0]}</span></div>
      <div class="tt-hint">Click for details</div>
    `;
    positionTooltip(e.originalEvent, tooltip);
  });

  map.on('mouseleave', 'districts-fill', () => {
    if (hoveredId !== null) {
      map.setFeatureState({ source: 'mh-districts', id: hoveredId }, { hover: false });
    }
    hoveredId = null;
    map.getCanvas().style.cursor = '';
    tooltip.classList.remove('visible');
  });

  map.on('click', 'districts-fill', (e) => {
    if (!e.features.length) return;
    const f = e.features[0];
    if (selectedDistrictId !== null) {
      map.setFeatureState({ source: 'mh-districts', id: selectedDistrictId }, { selected: false });
    }
    selectedDistrictId = f.id;
    map.setFeatureState({ source: 'mh-districts', id: selectedDistrictId }, { selected: true });
    showDistrictPanel(f.properties);
  });
}

function showDistrictPanel(p) {
  const panel = document.getElementById('panel');
  const body = document.getElementById('panelBody');
  panel.classList.add('open');
  // Only show a field if it has a value, so urban districts don't show empty rows
  const field = (label, value) =>
    value ? `<div class="field"><div class="k">${label}</div><div class="v">${value}</div></div>` : '';
  body.innerHTML = `
    <div class="eyebrow">District profile · Maharashtra${p.region ? ' · ' + p.region : ''}</div>
    <h2>${p.district_name}</h2>
    ${field('Main Crop', p.primary_crop)}
    ${field('Crops Grown', p.crops)}
    ${field('Kharif (monsoon) crops', p.kharif)}
    ${field('Rabi (winter) crops', p.rabi)}
    ${field('Fruits & Cash Crops', p.horticulture)}
    ${field('Soil', p.soil)}
    ${field('Rainfall', p.rainfall)}
    ${field('Irrigation & Rivers', p.irrigation)}
    ${field('Known For', p.special)}
    ${field('Challenges', p.challenges)}
    ${field('Notes', p.notes)}
    <button id="districtPdfBtn" class="download-btn" style="width:100%;border:none;cursor:pointer;font-family:inherit">Download ${p.district_name} PDF report</button>
    <button id="allDistrictsPdfBtn" class="download-btn" style="width:100%;cursor:pointer;font-family:inherit;margin-top:10px;background:transparent;border:1px solid var(--accent);color:var(--accent)">Download all districts PDF</button>
  `;
  currentDistrict = p;
  document.getElementById('districtPdfBtn').addEventListener('click', () => downloadDistrictPdf(p));
  document.getElementById('allDistrictsPdfBtn').addEventListener('click', downloadAllDistrictsPdf);
}

// ---- 7. NEW: district PDF reports (generated in the browser with jsPDF) ----
const REPORT_FIELDS = [
  ['Main crop', 'primary_crop'],
  ['Crops grown', 'crops'],
  ['Kharif (monsoon) crops', 'kharif'],
  ['Rabi (winter) crops', 'rabi'],
  ['Fruits & cash crops', 'horticulture'],
  ['Soil', 'soil'],
  ['Rainfall', 'rainfall'],
  ['Irrigation & rivers', 'irrigation'],
  ['Known for', 'special'],
  ['Challenges', 'challenges'],
  ['Notes', 'notes']
];

// jsPDF's built-in fonts only support basic Latin characters
function pdfSafe(t) {
  return String(t || '')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');
}

function drawDistrictReport(doc, rec) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;

  // header band
  doc.setFillColor(14, 26, 20);
  doc.rect(0, 0, W, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('KrishiMap', M, 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(124, 184, 122);
  doc.text('District Report - Maharashtra', W - M, 16, { align: 'right' });

  let y = 38;
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text(pdfSafe(rec.district_name), M, y);
  y += 8;
  if (rec.region) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(90, 90, 90);
    doc.text(pdfSafe(rec.region), M, y);
    y += 8;
  }
  y += 4;

  REPORT_FIELDS.forEach(([label, key]) => {
    const val = rec[key];
    if (!val) return;
    const lines = doc.splitTextToSize(pdfSafe(val), W - 2 * M);
    if (y + 10 + lines.length * 4.8 > H - 16) { doc.addPage(); y = 20; }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 120, 60);
    doc.text(label.toUpperCase(), M, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);
    doc.text(lines, M, y);
    y += lines.length * 4.8 + 2;

    doc.setDrawColor(225, 225, 225);
    doc.line(M, y, W - M, y);
    y += 5.5;
  });
}

function addPdfFooters(doc) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const total = doc.getNumberOfPages();
  const date = new Date().toLocaleDateString('en-IN');
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(130, 130, 130);
    doc.text('Generated by KrishiMap on ' + date + '. General summary; verify with the Maharashtra Agriculture Department.', 16, H - 10);
    doc.text('Page ' + i + ' of ' + total, W - 16, H - 10, { align: 'right' });
  }
}

function getJsPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert('The PDF library did not load. Check your internet connection and refresh the page.');
    return null;
  }
  return window.jspdf.jsPDF;
}

function downloadDistrictPdf(rec) {
  const JsPDF = getJsPdf();
  if (!JsPDF) return;
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  drawDistrictReport(doc, rec);
  addPdfFooters(doc);
  doc.save('KrishiMap_' + rec.district_name.replace(/\s+/g, '_') + '_report.pdf');
}

function downloadAllDistrictsPdf() {
  const JsPDF = getJsPdf();
  if (!JsPDF) return;
  if (!districtRecords.length) { alert('District data is not loaded yet.'); return; }
  const doc = new JsPDF({ unit: 'mm', format: 'a4' });
  const sorted = [...districtRecords].sort((a, b) => a.district_name.localeCompare(b.district_name));
  sorted.forEach((rec, i) => {
    if (i > 0) doc.addPage();
    drawDistrictReport(doc, rec);
  });
  addPdfFooters(doc);
  doc.save('KrishiMap_Maharashtra_all_districts_report.pdf');
}

function enterDistrictView() {
  // If district data failed to load, stay on the normal state view
  if (!map.getLayer('districts-fill')) return;
  inDistrictView = true;

  ['states-fill', 'states-outline'].forEach(id =>
    map.setLayoutProperty(id, 'visibility', 'none'));
  ['districts-fill', 'districts-outline'].forEach(id =>
    map.setLayoutProperty(id, 'visibility', 'visible'));

  document.getElementById('stateTooltip').classList.remove('visible');
  document.getElementById('backToIndia').style.display = 'block';
}

function exitDistrictView() {
  inDistrictView = false;

  ['districts-fill', 'districts-outline'].forEach(id =>
    map.setLayoutProperty(id, 'visibility', 'none'));
  ['states-fill', 'states-outline'].forEach(id =>
    map.setLayoutProperty(id, 'visibility', 'visible'));

  if (selectedDistrictId !== null) {
    map.setFeatureState({ source: 'mh-districts', id: selectedDistrictId }, { selected: false });
    selectedDistrictId = null;
  }
  if (selectedStateId !== null) {
    map.setFeatureState({ source: 'india-states', id: selectedStateId }, { selected: false });
    selectedStateId = null;
  }

  document.getElementById('stateTooltip').classList.remove('visible');
  document.getElementById('backToIndia').style.display = 'none';
  closePanel();
  map.flyTo({ center: [80.5, 22.5], zoom: 3.6, duration: 900 });
}

// NEW: Esc also leaves the district view
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && inDistrictView) exitDistrictView();
});

initMap();