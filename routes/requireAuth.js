// Simple session-based auth guard.
// Apply this to any route that should only work for a logged-in user.
function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Please log in to access this resource.' });
  }
  next();
}

module.exports = requireAuth;
