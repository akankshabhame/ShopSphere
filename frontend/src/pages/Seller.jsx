import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, IndianRupee, Package, ShoppingBag, AlertTriangle } from 'lucide-react';
import { api, money, fdate } from '../api';
import { useApp } from '../AppContext';
import { ProductImage } from '../components/ProductCard';
import { StatusBadge } from './Orders';

export const STATUS_LIST = ['Placed', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];
export const CATS = ['Fashion', 'Electronics', 'Home & Living', 'Beauty', 'Sports & Fitness', 'Books', 'Toys & Games', 'Lifestyle', 'Accessories'];
const blank = { name: '', subtitle: '', category: 'Fashion', price: '', mrp: '', stock: 10, emoji: '🛍️', image: '', description: '' };

export function Stat({ icon: I, label, value, warn }) {
  return <div className={'stat card' + (warn ? ' warn' : '')}><I size={22} /><div><span>{label}</span><b>{value}</b></div></div>;
}
export function Bars({ rows, label, value, fmt = (v) => v }) {
  const max = Math.max(1, ...rows.map(value));
  return <div className="bars">{rows.map((r) => <div key={label(r)} className="bar-row"><span>{label(r)}</span><div className="bar"><i style={{ width: (value(r) / max) * 100 + '%' }} /></div><b>{fmt(value(r))}</b></div>)}</div>;
}

export default function Seller() {
  const { notify, user } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [edit, setEdit] = useState(null);

  const load = () => {
    api('/seller/stats').then(setStats);
    api('/seller/products').then((r) => setProducts(r.products));
    api('/seller/orders').then((r) => setOrders(r.orders));
  };
  useEffect(load, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...edit, price: Number(edit.price), mrp: Number(edit.mrp), stock: Number(edit.stock) };
      if (edit.id) await api('/seller/products/' + edit.id, { method: 'PUT', body }); else await api('/seller/products', { method: 'POST', body });
      setEdit(null); notify('Product saved ✓'); load();
    } catch (ex) { notify(ex.message); }
  };
  const del = async (p) => { if (!confirm(`Delete "${p.name}"?`)) return; await api('/seller/products/' + p.id, { method: 'DELETE' }); notify('Product deleted'); load(); };
  const setStatus = async (o, status) => { try { await api(`/seller/orders/${o.id}/status`, { method: 'PUT', body: { status } }); notify('Order updated ✓'); load(); } catch (ex) { notify(ex.message); } };
  const f = (k) => ({ value: edit?.[k] ?? '', onChange: (e) => setEdit({ ...edit, [k]: e.target.value }) });

  if (!stats) return <div className="center-msg">Loading dashboard…</div>;
  return (
    <div className="container page">
      <div className="section-head"><div><h1 className="page-title">Seller Dashboard</h1><span className="muted">{user.storeName || user.name}</span></div>
        <button className="btn btn-dark" onClick={() => setEdit({ ...blank })}><Plus size={18} /> Add product</button></div>
      <div className="tabs">{['overview', 'products', 'orders'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === 'overview' && <>
        <div className="stats">
          <Stat icon={IndianRupee} label="Revenue" value={money(stats.revenue)} />
          <Stat icon={ShoppingBag} label="Orders" value={stats.orders} />
          <Stat icon={Package} label="Products" value={stats.products} />
          <Stat icon={AlertTriangle} label="Low stock (≤5)" value={stats.lowStock} warn={stats.lowStock > 0} />
        </div>
        <div className="card pad"><h3>Orders by status</h3><Bars rows={stats.byStatus} label={(r) => r.status} value={(r) => r.count} /></div>
      </>}

      {tab === 'products' && <div className="card table-wrap"><table>
        <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th /></tr></thead>
        <tbody>{products.map((p) => <tr key={p.id}>
          <td><div className="cell"><div className="thumb sm"><ProductImage p={p} /></div><div><b>{p.name}</b><div className="muted small">{p.subtitle}</div></div></div></td>
          <td>{p.category}</td><td>{money(p.price)}</td><td className={p.stock <= 5 ? 'red' : ''}>{p.stock}</td><td>{p.sales}</td>
          <td className="actions"><button className="ghost" onClick={() => setEdit({ ...p })}><Pencil size={17} /></button><button className="ghost" onClick={() => del(p)}><Trash2 size={17} /></button></td>
        </tr>)}{!products.length && <tr><td colSpan={6} className="muted">No products yet — add your first one!</td></tr>}</tbody></table></div>}

      {tab === 'orders' && <div className="card table-wrap"><table>
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
        <tbody>{orders.map((o) => <tr key={o.id}>
          <td><b>#{o.id}</b></td><td>{o.customerName}<div className="muted small">{o.address.city}</div></td>
          <td>{o.items.map((i) => <div key={i.productId} className="small">{i.name} × {i.qty}</div>)}</td><td className="small">{fdate(o.createdAt)}</td>
          <td><StatusBadge s={o.status} /></td>
          <td>{o.status === 'Cancelled' ? '—' : <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{STATUS_LIST.map((s) => <option key={s}>{s}</option>)}</select>}</td>
        </tr>)}{!orders.length && <tr><td colSpan={6} className="muted">No orders yet.</td></tr>}</tbody></table></div>}

      {edit && <div className="modal-bg" onClick={() => setEdit(null)}><form className="modal card" onClick={(e) => e.stopPropagation()} onSubmit={save}>
        <div className="section-head"><h3>{edit.id ? 'Edit product' : 'Add product'}</h3><button type="button" className="ghost" onClick={() => setEdit(null)}><X size={20} /></button></div>
        <div className="form-grid">
          <label className="span2">Name<input required {...f('name')} /></label>
          <label className="span2">Subtitle<input {...f('subtitle')} /></label>
          <label>Category<select {...f('category')}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
          <label>Emoji (shown if no image)<input {...f('emoji')} /></label>
          <label>Price (₹)<input type="number" min="1" required {...f('price')} /></label>
          <label>MRP (₹)<input type="number" min="1" {...f('mrp')} /></label>
          <label>Stock<input type="number" min="0" required {...f('stock')} /></label>
          <label>Image URL (optional)<input placeholder="https://…" {...f('image')} /></label>
          <label className="span2">Description<textarea rows={3} {...f('description')} /></label>
        </div>
        <button className="btn btn-dark" style={{ marginTop: 16 }}>Save product</button>
      </form></div>}
    </div>
  );
}
