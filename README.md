# KrishiMap

A web-based soil and crop information system for India — TE Sem V Mini Project I, Group 11.

This is a working starting scaffold: login/registration, IP-logged sessions, a MySQL-backed
states API, and a clickable map of India's states using MapLibre GL JS (free, no billing
required). It is **not finished** — treat it as Phase 0–2 of the roadmap, done for you so the
team can start Phase 3 onward immediately.

## 1. Prerequisites

- Node.js (v18+) and npm
- MySQL Server + MySQL Workbench (or any MySQL client)
- Git

## 2. Setup

```bash
# install dependencies
npm install

# create the database and tables
mysql -u root -p < sql/schema.sql

# load sample state data (covers ~20 states — see "Remaining data entry" below)
mysql -u root -p < sql/seed_states.sql

# set up your local environment file
cp .env.example .env
# then edit .env with your real MySQL password and a random session secret
```

## 3. Run it

```bash
npm start
```

Visit `http://localhost:3000/register.html` to create an account, then log in and you'll land
on the map at `http://localhost:3000/map.html`.

## 4. What's already built

- **Auth**: `/api/auth/register`, `/login`, `/logout`, `/me` — bcrypt password hashing,
  session cookies, IP address logged into `login_logs` on every successful login
  (`routes/auth.js`, see `getClientIp()` — this is your CCN demo piece).
- **States API**: `/api/states` (list) and `/api/states/:name` (single report), both gated
  behind login via `routes/requireAuth.js`.
- **Frontend**: `login.html`, `register.html`, `map.html` — a clickable India map with a
  slide-in soil report panel, built on MapLibre GL JS.
- **Real state boundaries**: `public/data/india_states.geojson`, sourced from a public dataset
  and simplified (23MB → ~465KB) so it loads fast in the browser.

## 5. Known caveats — read before your next demo/submission

- **The boundary data is outdated.** It's missing **Telangana** (formed 2014, split from
  Andhra Pradesh) and still shows **undivided Jammu & Kashmir** (reorganized in 2019 into
  J&K and Ladakh). Before showing this to your faculty guide or submitting anything public,
  either find an updated GeoJSON source or manually patch these two. Also worth checking your
  final map against the Survey of India's official guidelines on depicting India's boundaries,
  since student projects distributed publicly are technically expected to follow them too.
- **The basemap is MapLibre's free demo style** — it's just simple outlines, not satellite or
  terrain imagery. It costs nothing and needs no signup, which is why it's the default here.
  See "Upgrading the basemap" below for the closer-to-Google-Maps look.
- **Only ~20 of 35 states have seed data.** The map will show "No data yet" for the rest until
  someone adds rows to `sql/seed_states.sql` (or directly into the `states` table).

## 6. Upgrading the basemap (optional, still free)

To get real satellite/terrain imagery and a 3D tilt (closer to what Google Maps looks like):

1. Sign up for a free MapTiler account (no credit card required) and grab an API key.
2. In `public/js/map.js`, change `MAP_STYLE` to something like:
   `https://api.maptiler.com/maps/satellite/style.json?key=YOUR_KEY`
3. Add a terrain source and call `map.setTerrain({ source: 'terrain-rgb', exaggeration: 1.2 })`
   after the style loads, using MapTiler's terrain-RGB tile source. Set `pitch: 45` on map init
   for the tilted 3D look.
4. MapTiler's free tier (~100k tile requests/month) is enough for a student project demo.

## 7. Remaining roadmap (Phases 3–6)

- **Phase 3 (backend)** — mostly done here; still needed: input validation hardening, rate
  limiting on login, maybe a "forgot password" flow if your guide expects one.
- **Phase 4 (frontend/map)** — done: clickable states, side panel, session gating. Still
  needed: hover tooltips with state name, loading states, mobile responsiveness pass.
- **Phase 5 (integration)** — do a full end-to-end test: register → login → check
  `login_logs` table populated correctly → click state → see data → logout.
- **Phase 6 (docs/report)** — screenshots for Appendix B, system architecture flowchart,
  final report writeup.

## 8. Project structure

```
krishimap/
├── server.js              # Express entry point
├── config/db.js           # MySQL connection pool
├── routes/
│   ├── auth.js             # register / login / logout / me
│   ├── states.js           # states list + single state report
│   └── requireAuth.js      # session auth guard middleware
├── sql/
│   ├── schema.sql          # users, states, login_logs tables
│   └── seed_states.sql     # sample data for ~20 states
├── public/
│   ├── login.html
│   ├── register.html
│   ├── map.html
│   ├── css/
│   ├── js/map.js           # MapLibre init + interactions
│   └── data/india_states.geojson
└── .env.example
```
