const router = require('express').Router();
const bcrypt = require('bcryptjs');
const store = require('../db');
const { auth, sign, publicUser } = require('../middleware/auth');

router.post('/register', (req, res) => {
  const { name, email, password, role, storeName } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const mail = email.trim().toLowerCase();
  if (store.db.users.some((u) => u.email === mail)) return res.status(409).json({ error: 'Email is already registered' });
  const user = {
    id: store.nextId('users'), name: name.trim(), email: mail,
    password: bcrypt.hashSync(password, 10),
    role: role === 'seller' ? 'seller' : 'customer',
    storeName: role === 'seller' ? (storeName || name + ' Store') : undefined,
    phone: '', address: null, cart: [], wishlist: [], createdAt: new Date().toISOString(),
  };
  store.db.users.push(user); store.save();
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  const user = store.db.users.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password || '', user.password)) return res.status(401).json({ error: 'Invalid email or password' });
  if (user.blocked) return res.status(403).json({ error: 'This account has been suspended' });
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', auth(), (req, res) => res.json({ user: publicUser(req.user) }));

router.put('/profile', auth(), (req, res) => {
  const { name, phone, address, storeName } = req.body || {};
  const u = req.user;
  if (name) u.name = name;
  if (phone !== undefined) u.phone = phone;
  if (address !== undefined) u.address = address;
  if (storeName && u.role === 'seller') u.storeName = storeName;
  store.save();
  res.json({ user: publicUser(u) });
});

router.put('/password', auth(), (req, res) => {
  const { current, next } = req.body || {};
  if (!bcrypt.compareSync(current || '', req.user.password)) return res.status(400).json({ error: 'Current password is incorrect' });
  if (!next || next.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
  req.user.password = bcrypt.hashSync(next, 10); store.save();
  res.json({ ok: true });
});

// Persist cart & wishlist for logged-in users
router.put('/sync', auth(), (req, res) => {
  const { cart, wishlist } = req.body || {};
  if (Array.isArray(cart)) req.user.cart = cart.slice(0, 100);
  if (Array.isArray(wishlist)) req.user.wishlist = wishlist.slice(0, 200);
  store.save();
  res.json({ ok: true });
});

module.exports = router;
