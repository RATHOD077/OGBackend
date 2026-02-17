// src/middleware/auth.js
function clientAuth(req, res, next) {
  const clientId = req.headers['client-id'];

  if (!clientId || typeof clientId !== 'string' || clientId.length !== 36) {
    return res.status(401).json({
      error: 'Missing or invalid client-id header (must be valid UUID)'
    });
  }

  req.clientId = clientId;
  next();
}

function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-secret'] || req.headers.authorization;

  if (!secret || secret !== 'admin-secret-123') {
    return res.status(403).json({ error: 'Admin access denied' });
  }
  next();
}

module.exports = { clientAuth, adminAuth };