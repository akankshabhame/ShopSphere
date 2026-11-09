const jwt = require('jsonwebtoken');
const store = require('../db');
const SECRET = process.env.JWT_SECRET || 'shopsphere-dev-secret-change-me';

const sign = (u) => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: '7d' });
const publicUser = (u) => { const { password, ...rest } = u; return rest; };

// auth() = any logged-in user, auth('seller','admin') = restrict by role
function auth(...roles) {
  return (req, res, next) => {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Please log in to continue' });
    try {
      const p = jwt.verify(token, SECRET);
      const user = store.db.users.find((x) => x.id === p.id);
      if (!user) return res.status(401).json({ error: 'Account not found' });
      if (user.blocked) return res.status(403).json({ error: 'This account has been suspended' });
      if (roles.length && !roles.includes(user.role)) return res.status(403).json({ error: 'You do not have access to this area' });
      req.user = user;
      next();
    } catch {
      res.status(401).json({ error: 'Session expired, please log in again' });
    }
  };
}
module.exports = { auth, sign, publicUser };
