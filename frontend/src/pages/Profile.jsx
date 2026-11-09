import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useApp } from '../AppContext';

export default function Profile() {
  const { user, setUser, notify, logout } = useApp();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', storeName: user.storeName || '' });
  const [a, setA] = useState(user.address || { name: user.name, phone: '', line1: '', city: '', state: '', pincode: '' });
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState('');

  const save = async (e) => {
    e.preventDefault();
    try { const r = await api('/auth/profile', { method: 'PUT', body: { ...f, address: a.line1 ? a : null } }); setUser(r.user); notify('Profile saved ✓'); } catch (ex) { notify(ex.message); }
  };
  const changePw = async (e) => {
    e.preventDefault(); setMsg('');
    try { await api('/auth/password', { method: 'PUT', body: pw }); setPw({ current: '', next: '' }); notify('Password updated ✓'); } catch (ex) { setMsg(ex.message); }
  };
  const ad = (k) => ({ value: a[k] || '', onChange: (e) => setA({ ...a, [k]: e.target.value }) });

  return (
    <div className="container page narrow">
      <div className="profile-head card pad">
        <span className="avatar xl">{user.name[0].toUpperCase()}</span>
        <div><h1 className="page-title" style={{ margin: 0 }}>{user.name}</h1><div className="muted">{user.email} · <span className="tag">{user.role}</span></div></div>
        <div className="grow" />
        <Link to="/orders" className="btn btn-outline btn-sm">My orders</Link>
        <button className="btn btn-outline btn-sm" onClick={logout}>Logout</button>
      </div>
      <form className="card pad" onSubmit={save} style={{ marginTop: 20 }}>
        <h3>Personal details</h3>
        <div className="form-grid">
          <label>Name<input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
          <label>Phone<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          {user.role === 'seller' && <label className="span2">Store name<input value={f.storeName} onChange={(e) => setF({ ...f, storeName: e.target.value })} /></label>}
        </div>
        <h3 style={{ marginTop: 24 }}>Saved address</h3>
        <div className="form-grid">
          <label>Full name<input {...ad('name')} /></label><label>Phone<input {...ad('phone')} /></label>
          <label className="span2">Address<input {...ad('line1')} /></label>
          <label>City<input {...ad('city')} /></label><label>State<input {...ad('state')} /></label><label>Pincode<input maxLength={6} {...ad('pincode')} /></label>
        </div>
        <button className="btn btn-dark" style={{ marginTop: 18 }}>Save changes</button>
      </form>
      <form className="card pad" onSubmit={changePw} style={{ marginTop: 20 }}>
        <h3>Change password</h3>
        <div className="form-grid">
          <label>Current password<input type="password" required value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></label>
          <label>New password<input type="password" required minLength={6} value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} /></label>
        </div>
        {msg && <div className="alert">{msg}</div>}
        <button className="btn btn-outline" style={{ marginTop: 14 }}>Update password</button>
      </form>
    </div>
  );
}
