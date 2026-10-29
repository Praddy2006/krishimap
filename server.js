require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const stateRoutes = require('./routes/states');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_only_secret_change_me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 4 // 4 hours
  }
}));

// Static frontend (login.html, register.html, map.html, css, js, geojson data)
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/states', stateRoutes);

app.listen(PORT, () => {
  console.log(`KrishiMap server running at http://localhost:${PORT}`);
});
