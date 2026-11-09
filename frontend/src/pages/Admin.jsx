import { useEffect, useState } from 'react';
import { Users, Store, Package, ShoppingBag, IndianRupee, Trash2, Ban, CheckCircle } from 'lucide-react';
import { api, money, fdate } from '../api';
import { useApp } from '../AppContext';
import { StatusBadge } from './Orders';
import { Stat, Bars, STATUS_LIST } from './Seller';
import { Link } from 'react-router-dom';

export default function Admin() {
  const { notify } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const load = () => {
    api('/admin/stats').then(setStats);
    api('/admin/users').then((r) => setUsers(r.users));
    api('/admin/products').then((r) => setProducts(r.products));
    api('/admin/orders').then((r) => setOrders(r.orders));
  };
  useEffect(load, []);

  const block = async (u) => { try { await api(`/admin/users/${u.id}/block`, { method: 'PUT' }); notify(u.blocked ? 'User reactivated' : 'User suspended'); load(); } catch (e) { notify(e.message); } };
  const delProduct = async (p) => { if (!confirm(`Remove "${p.name}"?`)) return; await api('/admin/products/' + p.id, { method: 'DELETE' }); notify('Product removed'); load(); };
  const setStatus = async (o, status) => { await api(`/admin/orders/${o.id}/status`, { method: 'PUT', body: { status } }); notify('Order updated ✓'); load(); };

  if (!stats) return <div className="center-msg">Loading dashboard…</div>;
  return (
    <div className="container page">
      <h1 className="page-title">Admin Dashboard</h1>
      <div className="tabs">{['overview', 'users', 'products', 'orders'].map((t) => <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>

      {tab === 'overview' && <>
        <div className="stats five">
          <Stat icon={IndianRupee} label="Revenue" value={money(stats.revenue)} />
          <Stat icon={ShoppingBag} label="Orders" value={stats.orders} />
          <Stat icon={Users} label="Customers" value={stats.users} />
          <Stat icon={Store} label="Sellers" value={stats.sellers} />
          <Stat icon={Package} label="Products" value={stats.products} />
        </div>
        <div className="two-eq">
          <div className="card pad"><h3>Orders by status</h3><Bars rows={stats.byStatus} label={(r) => r.status} value={(r) => r.count} /></div>
          <div className="card pad"><h3>Revenue by category</h3>{stats.byCategory.length ? <Bars rows={stats.byCategory} label={(r) => r.category} value={(r) => r.revenue} fmt={money} /> : <p className="muted">No sales yet.</p>}</div>
        </div>
      </>}

      {tab === 'users' && <div className="card table-wrap"><table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th /></tr></thead>
        <tbody>{users.map((u) => <tr key={u.id}>
          <td><b>{u.name}</b>{u.storeName && <div className="muted small">{u.storeName}</div>}</td><td>{u.email}</td><td><span className="tag">{u.role}</span></td>
          <td className="small">{fdate(u.createdAt)}</td><td>{u.blocked ? <span className="red">Suspended</span> : 'Active'}</td>
          <td className="actions">{u.role !== 'admin' && <button className="ghost" onClick={() => block(u)} title={u.blocked ? 'Reactivate' : 'Suspend'}>{u.blocked ? <CheckCircle size={18} /> : <Ban size={18} />}</button>}</td>
        </tr>)}</tbody></table></div>}

      {tab === 'products' && <div className="card table-wrap"><table>
        <thead><tr><th>Product</th><th>Seller</th><th>Category</th><th>Price</th><th>Stock</th><th /></tr></thead>
        <tbody>{products.map((p) => <tr key={p.id}>
          <td><Link to={'/product/' + p.id} className="link"><b>{p.name}</b></Link></td><td>{p.sellerName}</td><td>{p.category}</td><td>{money(p.price)}</td><td>{p.stock}</td>
          <td className="actions"><button className="ghost" onClick={() => delProduct(p)}><Trash2 size={17} /></button></td>
        </tr>)}</tbody></table></div>}

      {tab === 'orders' && <div className="card table-wrap"><table>
        <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Date</th><th>Status</th><th>Update</th></tr></thead>
        <tbody>{orders.map((o) => <tr key={o.id}>
          <td><Link to={'/orders/' + o.id} className="link"><b>#{o.id}</b></Link></td><td>{o.customerName}</td><td>{money(o.total)}</td><td>{o.payment}</td><td className="small">{fdate(o.createdAt)}</td>
          <td><StatusBadge s={o.status} /></td>
          <td>{o.status === 'Cancelled' ? '—' : <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{STATUS_LIST.map((s) => <option key={s}>{s}</option>)}</select>}</td>
        </tr>)}{!orders.length && <tr><td colSpan={7} className="muted">No orders yet.</td></tr>}</tbody></table></div>}
    </div>
  );
}
