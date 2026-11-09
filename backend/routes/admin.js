const router = require('express').Router();
const store = require('../db');
const { auth, publicUser } = require('../middleware/auth');
const { STATUSES } = require('./orders');

router.use(auth('admin'));

router.get('/stats', (req, res) => {
  const { users, products, orders } = store.db;
  const valid = orders.filter((o) => o.status !== 'Cancelled');
  const cats = {};
  valid.forEach((o) => o.items.forEach((i) => {
    const p = products.find((x) => x.id === i.productId);
    if (p) cats[p.category] = (cats[p.category] || 0) + i.price * i.qty;
  }));
  res.json({
    users: users.filter((u) => u.role === 'customer').length,
    sellers: users.filter((u) => u.role === 'seller').length,
    products: products.filter((p) => p.active !== false).length,
    orders: orders.length,
    revenue: valid.reduce((s, o) => s + o.total, 0),
    byStatus: [...STATUSES, 'Cancelled'].map((s) => ({ status: s, count: orders.filter((o) => o.status === s).length })),
    byCategory: Object.entries(cats).map(([category, revenue]) => ({ category, revenue })).sort((a, b) => b.revenue - a.revenue),
  });
});

router.get('/users', (req, res) => res.json({ users: store.db.users.map(publicUser).map(({ cart, wishlist, ...u }) => u) }));

router.put('/users/:id/block', (req, res) => {
  const u = store.db.users.find((x) => x.id === Number(req.params.id));
  if (!u) return res.status(404).json({ error: 'User not found' });
  if (u.role === 'admin') return res.status(400).json({ error: 'Admins cannot be suspended' });
  u.blocked = !u.blocked; store.save();
  res.json({ user: publicUser(u) });
});

router.get('/products', (req, res) => res.json({ products: store.db.products.filter((p) => p.active !== false) }));

router.delete('/products/:id', (req, res) => {
  const p = store.db.products.find((x) => x.id === Number(req.params.id));
  if (!p) return res.status(404).json({ error: 'Product not found' });
  p.active = false; store.save();
  res.json({ ok: true });
});

router.get('/orders', (req, res) => res.json({ orders: [...store.db.orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) }));

router.put('/orders/:id/status', (req, res) => {
  const o = store.db.orders.find((x) => x.id === req.params.id);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  if (!STATUSES.includes(req.body.status)) return res.status(400).json({ error: 'Invalid status' });
  o.status = req.body.status;
  if (!o.timeline.some((t) => t.status === o.status)) o.timeline.push({ status: o.status, at: new Date().toISOString() });
  store.save();
  res.json({ order: o });
});

module.exports = router;
