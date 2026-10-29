// KrishiMap FAQ chatbot — NOT AI.
// Every question and answer below is written by hand. When a user types a
// message, we look for the keywords listed on each entry and show the answer
// of the best match. To add a new Q&A, just add one more object to FAQ.

(function () {
  const FAQ = [
    // ---------- About the app ----------
    { id: 'what', q: 'What is KrishiMap?',
      a: 'KrishiMap is a web app that shows state-wise soil type, major crops, climate and farming notes for India on an interactive map. Log in, then click any state to see its report.',
      keys: ['krishimap', 'krishi map', 'what is this', 'about this', 'this website', 'this app', 'project'],
      related: ['how', 'tech', 'team', 'ai'] },
    { id: 'how', q: 'How do I use the map?',
      a: 'Move your mouse over a state for a quick preview, click it for the full report, or type its name in the search bar at the top. Use the button at the bottom right to switch between the political and physical map.',
      keys: ['how to use', 'how do i use', 'use the map', 'get started', 'guide', 'help', 'instructions', 'navigate'],
      related: ['hover', 'click', 'search', 'physical'] },
    { id: 'hover', q: 'What happens when I hover over a state?',
      a: 'A small card follows your cursor and shows the state name, its soil type and its major crops. It says "Click for full report" at the bottom.',
      keys: ['hover', 'tooltip', 'mouse over', 'cursor', 'preview'],
      related: ['click', 'search'] },
    { id: 'click', q: 'What happens when I click a state?',
      a: 'The map zooms to that state and a side panel opens with its soil type, major crops, climate and farming notes. The panel also has a "Download PDF report" button. Each click is saved to your visited states.',
      keys: ['click', 'full report', 'side panel', 'panel', 'open a state'],
      related: ['pdf', 'visited'] },
    { id: 'search', q: 'How do I search for a state?',
      a: 'Type in the search box at the top of the page, then pick a state from the list or press Enter. The map zooms to it and opens its report. The search works on state names, not cities.',
      keys: ['search', 'find a state', 'look up', 'search bar', 'locate', 'city', 'cities'],
      related: ['click', 'states'] },
    { id: 'physical', q: 'What is the physical map button?',
      a: 'The button at the bottom right switches the plain map to a terrain map (OpenTopoMap) that shows mountains, plateaus and plains. State outlines stay clickable. Press it again to return to the political map.',
      keys: ['physical', 'terrain', 'relief', 'mountain map', 'toggle', 'political map', 'topographic', 'plateau', 'hills', 'plains'],
      related: ['hover', 'click'] },

    // ---------- Reports ----------
    { id: 'pdf', q: "How do I download a state's report?",
      a: 'Click the state on the map, then press "Download PDF report" at the bottom of the side panel.',
      keys: ['download', 'pdf', 'state report', 'save report', 'single report'],
      related: ['allreport', 'visited'] },
    { id: 'allreport', q: 'What is the "All states report"?',
      a: 'It is a link in the top bar. It downloads one PDF that contains every state and union territory in the database, one state per page.',
      keys: ['all states report', 'all states', 'every state report', 'complete report'],
      related: ['visited', 'pdf'] },
    { id: 'visited', q: 'What is "My visited states"?',
      a: 'It is a link in the top bar. It downloads a PDF with only the states you have clicked, along with how many times you visited each and when you last visited. If you have not clicked any state yet, the PDF says so.',
      keys: ['visited', 'my visited', 'history', 'states i clicked', 'visited states'],
      related: ['allreport', 'pdf'] },

    // ---------- Account and security ----------
    { id: 'register', q: 'How do I create an account?',
      a: 'On the login page, click "Create an account". Enter your name, email and a password of at least 6 characters, then log in.',
      keys: ['register', 'sign up', 'signup', 'create account', 'new account', 'account'],
      related: ['security', 'logout'] },
    { id: 'logout', q: 'How do I log out?',
      a: 'Press the "Log out" button at the top right of the map page.',
      keys: ['logout', 'log out', 'sign out'],
      related: ['register', 'security'] },
    { id: 'forgot', q: 'I forgot my password',
      a: 'Password reset is not built yet. You can register again with a different email, or ask the KrishiMap team for help.',
      keys: ['forgot', 'forget', 'reset', 'lost password', 'recover'],
      related: ['register', 'security'] },
    { id: 'security', q: 'Is my password safe?',
      a: 'Yes. Passwords are hashed with bcrypt before they are saved, so the real password is never stored. Database queries use parameters to prevent SQL injection, and login uses a session cookie.',
      keys: ['password', 'safe', 'secure', 'security', 'bcrypt', 'hash', 'privacy', 'data safe'],
      related: ['ip', 'forgot'] },
    { id: 'ip', q: 'Why does KrishiMap log my IP address?',
      a: 'This is part of the Computer Communications and Networks (CCN) part of our project. At every successful login, your IP address and the login time are saved in the login_logs table to show client-server communication and IP addressing.',
      keys: ['ip', 'ip address', 'logging', 'login log', 'login logs', 'track', 'tracking'],
      related: ['security', 'team'] },

    // ---------- Data and project ----------
    { id: 'states', q: 'How many states does KrishiMap cover?',
      a: 'All 36 states and union territories, including Telangana and Ladakh.',
      keys: ['how many states', 'coverage', 'covered', 'union territor', '36', 'which states'],
      related: ['nodata', 'source'] },
    { id: 'nodata', q: 'Why does a state show "No data yet"?',
      a: 'It means that state has no row in the states table yet. Please tell the KrishiMap team so the data can be added.',
      keys: ['no data', 'missing data', 'not available', 'empty', 'blank'],
      related: ['states', 'source'] },
    { id: 'source', q: 'Where does the data come from?',
      a: 'It was compiled from government agriculture sources such as the Soil Health Card scheme, state agriculture departments and open datasets. The reports are general state-level summaries, so they cannot replace a soil test of your own field.',
      keys: ['source', 'where does', 'data from', 'reference', 'accuracy', 'accurate', 'reliable', 'dataset'],
      related: ['health', 'states'] },
    { id: 'tech', q: 'What technologies are used?',
      a: 'Frontend: HTML, CSS, JavaScript and MapLibre GL JS. Backend: Node.js with Express. Database: MySQL. Extras: bcrypt and express-session for login, and pdfkit for PDF reports.',
      keys: ['technology', 'technologies', 'tech stack', 'built with', 'stack', 'node', 'express', 'mysql', 'database', 'maplibre', 'frontend', 'backend'],
      related: ['team', 'ai'] },
    { id: 'team', q: 'Who made KrishiMap?',
      a: 'Group 11: Sai Khedekar, Pradyumna Acharyya and Swanand Vidyasagar, guided by Prof. Swati Vyas, as the TE Sem V Mini Project I at Sardar Patel Institute of Technology.',
      keys: ['who made', 'who built', 'who created', 'team', 'developer', 'developers', 'group', 'guide', 'faculty', 'creator', 'made by'],
      related: ['what', 'tech'] },
    { id: 'ai', q: 'Is this chatbot AI?',
      a: 'No. Every question and answer was written by the team in advance. The bot only matches the words you type with its list. If it does not know something, it says so.',
      keys: ['ai', 'chatgpt', 'artificial', 'bot', 'robot', 'are you real', 'are you human'],
      related: ['what', 'tech'] },
    { id: 'mobile', q: 'Does it work on mobile?',
      a: 'Yes, in a mobile browser. Tap a state to open its report. The hover preview only works with a mouse.',
      keys: ['mobile', 'phone', 'touch', 'tablet', 'responsive'],
      related: ['how', 'click'] },

    // ---------- Soil and crop knowledge ----------
    { id: 'soiltypes', q: 'What are the main soil types in India?',
      a: 'The main types are alluvial, black (regur), red, laterite, arid (desert) and mountain / forest soils. Ask me about any one of them.',
      keys: ['soil types', 'types of soil', 'kinds of soil', 'soil in india', 'main soils', 'soil classification'],
      related: ['alluvial', 'black', 'red', 'laterite'] },
    { id: 'alluvial', q: 'What is alluvial soil?',
      a: 'Alluvial soil is deposited by rivers and found in the Indo-Gangetic plain and river deltas (Punjab, Haryana, Uttar Pradesh, Bihar, West Bengal). It is very fertile and good for wheat, rice and sugarcane.',
      keys: ['alluvial'],
      related: ['black', 'red', 'cropsoil'] },
    { id: 'black', q: 'What is black soil?',
      a: 'Black soil (regur) forms from volcanic basalt rock on the Deccan plateau, in Maharashtra, Madhya Pradesh and Gujarat. It holds moisture well, so it is best known for cotton. It also grows soybean and sugarcane.',
      keys: ['black soil', 'regur', 'cotton soil'],
      related: ['red', 'alluvial', 'cropsoil'] },
    { id: 'red', q: 'What is red soil?',
      a: 'Red soil gets its colour from iron. It is found in Tamil Nadu, Karnataka, Odisha and Jharkhand. It is low in nitrogen and humus, and suits millets, groundnut and pulses.',
      keys: ['red soil'],
      related: ['laterite', 'black', 'cropsoil'] },
    { id: 'laterite', q: 'What is laterite soil?',
      a: 'Laterite soil forms in regions with heavy rainfall, such as Kerala, coastal Karnataka and the Western Ghats. Rain washes out its nutrients, but with care it supports tea, coffee, rubber and cashew.',
      keys: ['laterite', 'lateritic'],
      related: ['red', 'desert', 'cropsoil'] },
    { id: 'desert', q: 'What is arid / desert soil?',
      a: 'Arid soil is sandy and low in moisture and humus. It is found in Rajasthan and parts of Gujarat and Haryana. Drought-tolerant crops like bajra (pearl millet) and pulses grow well with irrigation.',
      keys: ['desert soil', 'arid soil', 'sandy soil', 'thar'],
      related: ['mountain', 'alluvial'] },
    { id: 'mountain', q: 'What are mountain and forest soils?',
      a: 'These soils are found on the Himalayan slopes, in Himachal Pradesh, Uttarakhand, Jammu and Kashmir and the north-east. They are rich in organic matter but thin and prone to erosion. Apples, temperate fruits and tea are grown there.',
      keys: ['mountain soil', 'forest soil', 'himalayan soil', 'hill soil'],
      related: ['desert', 'soiltypes'] },
    { id: 'cropsoil', q: 'Which soil suits which crop?',
      a: 'Rice: alluvial or clayey soil. Wheat: well-drained alluvial or loamy soil. Cotton: black soil. Sugarcane: deep alluvial or black soil. Groundnut and millets: red or sandy loam. Tea: acidic hill soils (Assam, Darjeeling). Coffee, rubber and cashew: laterite and red soils of the south. Apples: Himalayan mountain soils.',
      keys: ['which soil', 'best soil', 'suits', 'suitable', 'soil for', 'crop for', 'what to grow', 'what crop'],
      related: ['soiltypes', 'seasons'] },
    { id: 'seasons', q: 'What are Kharif, Rabi and Zaid seasons?',
      a: 'Kharif: sown with the monsoon (June-July), harvested Sept-Oct. Examples: rice, maize, cotton, soybean, bajra.\nRabi: sown in Oct-Nov, harvested Mar-Apr. Examples: wheat, barley, mustard, gram, peas.\nZaid: short summer season (Mar-June). Examples: watermelon, cucumber, muskmelon, fodder.',
      keys: ['kharif', 'rabi', 'zaid', 'season', 'seasons', 'sowing', 'harvest'],
      related: ['cropsoil', 'soiltypes'] },
    { id: 'health', q: 'What is the Soil Health Card?',
      a: 'It is a Government of India scheme in which farmers receive a card showing the nutrient status of their soil, along with recommended fertilizer doses. It is one of the sources that motivated KrishiMap.',
      keys: ['soil health card', 'health card', 'soil testing', 'soil test'],
      related: ['source', 'ph'] },
    { id: 'ph', q: 'What is soil pH?',
      a: 'Soil pH tells you how acidic or alkaline the soil is, on a scale of 0 to 14. 7 is neutral, below 7 is acidic and above 7 is alkaline. Most crops prefer about 6 to 7.5, while tea prefers acidic soil.',
      keys: ['ph', 'soil ph', 'acidic', 'alkaline', 'acidity'],
      related: ['health', 'cropsoil'] },

    // ---------- Small talk ----------
    { id: 'hello', q: 'Hello',
      a: 'Hello! Ask me about using the map, reports, or Indian soils and crops.',
      keys: ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good evening'],
      related: ['how', 'soiltypes', 'pdf'], hidden: true },
    { id: 'thanks', q: 'Thanks',
      a: "You're welcome! Ask me anything else if you like.",
      keys: ['thanks', 'thank you', 'thx', 'helpful'],
      related: ['how', 'soiltypes'], hidden: true },
    { id: 'bye', q: 'Bye',
      a: 'Goodbye! Happy exploring.',
      keys: ['bye', 'goodbye', 'see you'],
      related: [], hidden: true },
  ];

  const START_CHIPS = ['what', 'how', 'hover', 'search', 'pdf', 'soiltypes'];
  const GREETING = "Hi! I'm the KrishiMap helper. I answer from a fixed list of questions about the app and about Indian soils and crops. Tap a question below or type your own.";
  const FALLBACK = "Sorry, I don't have an answer for that yet. I only know a fixed set of questions. Try one of these:";
  const byId = {};
  FAQ.forEach(f => { byId[f.id] = f; });

  // ---------- matching ----------
  function normalize(text) {
    return ' ' + text.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  }
  function keyMatches(norm, key) {
    // short keys must match a whole word; longer keys also match plurals (crop -> crops)
    return key.length < 4 ? norm.includes(' ' + key + ' ') : norm.includes(' ' + key);
  }
  function findAnswer(text) {
    const norm = normalize(text);
    let best = null, bestScore = 0;
    FAQ.forEach(item => {
      let score = 0;
      item.keys.forEach(k => { if (keyMatches(norm, k)) score += k.length; });
      if (score > bestScore) { bestScore = score; best = item; }
    });
    return best;
  }

  // ---------- build the UI ----------
  const launcher = document.createElement('button');
  launcher.id = 'chatLauncher';
  launcher.setAttribute('aria-label', 'Open KrishiMap helper chat');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  const win = document.createElement('div');
  win.id = 'chatWindow';
  win.innerHTML =
    '<div class="chat-head">' +
      '<div><div class="chat-title">KrishiMap helper</div><div class="chat-sub">Pre-written answers, no AI</div></div>' +
      '<button class="chat-close" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div class="chat-messages" id="chatMessages"></div>' +
    '<div class="chat-chips" id="chatChips"></div>' +
    '<form class="chat-form" id="chatForm" autocomplete="off">' +
      '<input type="text" id="chatInput" placeholder="Type your question..." />' +
      '<button type="submit">Send</button>' +
    '</form>';

  document.body.appendChild(launcher);
  document.body.appendChild(win);

  const messages = win.querySelector('#chatMessages');
  const chips = win.querySelector('#chatChips');
  const form = win.querySelector('#chatForm');
  const input = win.querySelector('#chatInput');
  let greeted = false;

  function addMessage(text, who) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + who;
    div.textContent = text; // textContent keeps user input harmless
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
  function showChips(ids) {
    chips.innerHTML = '';
    ids.forEach(id => {
      const item = byId[id];
      if (!item) return;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chat-chip';
      b.textContent = item.q;
      b.addEventListener('click', () => ask(item.q, item));
      chips.appendChild(b);
    });
  }
  function ask(text, knownItem) {
    addMessage(text, 'user');
    const item = knownItem || findAnswer(text);
    setTimeout(() => {
      if (item) {
        addMessage(item.a, 'bot');
        showChips(item.related.length ? item.related : START_CHIPS);
      } else {
        addMessage(FALLBACK, 'bot');
        showChips(START_CHIPS);
      }
    }, 250);
  }

  function openChat() {
    win.classList.add('open');
    launcher.classList.add('hidden');
    if (!greeted) {
      greeted = true;
      addMessage(GREETING, 'bot');
      showChips(START_CHIPS);
    }
    input.focus();
  }
  function closeChat() {
    win.classList.remove('open');
    launcher.classList.remove('hidden');
  }

  launcher.addEventListener('click', openChat);
  win.querySelector('.chat-close').addEventListener('click', closeChat);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    ask(text);
  });
})();