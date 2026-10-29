const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = express.Router();
const SALT_ROUNDS = 10;

// Helper: pull the "real" client IP even if behind a proxy/load balancer.
// req.ip alone is enough for local/dev use; the X-Forwarded-For check
// matters once this is deployed behind something like Nginx or a cloud LB.
function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip;
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are all required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    );

    res.status(201).json({ message: 'Registration successful. You can now log in.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // --- CCN requirement: log the client's IP address on every successful login ---
    const ip = getClientIp(req);
    await pool.query(
      'INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)',
      [user.id, ip]
    );

    req.session.userId = user.id;
    req.session.userName = user.name;

    res.json({ message: 'Login successful.', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out.' });
  });
});

// GET /api/auth/me — lets the frontend check "am I logged in?"
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ loggedIn: false });
  }
  res.json({ loggedIn: true, name: req.session.userName });
});

module.exports = router;
