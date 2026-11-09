import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { api } from '../api';
import { useApp } from '../AppContext';

function Shell({ title, sub, children }) {
  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="logo center"><ShoppingBag size={28} strokeWidth={1.6} /> ShopSphere</div>
        <h2>{title}</h2><p className="muted">{sub}</p>
        {children}
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useApp();
  const nav = useNavigate();
  const { state } = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [err, setErr] = useState('');
  const go = async (e, creds = f) => {
    e?.preventDefault(); setErr('');
    try {
      const r = await api('/auth/login', { method: 'POST', body: creds });
      login(r.token, r.user);
      nav(state?.from || (r.user.role === 'admin' ? '/admin' : r.user.role === 'seller' ? '/seller' : '/'), { replace: true });
    } catch (ex) { setErr(ex.message); }
  };
  return (
    <Shell title="Welcome back" sub="Log in to continue shopping">
      <form onSubmit={go} className="stack">
        <label>Email<input type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label>Password<input type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        {err && <div className="alert">{err}</div>}
        <button className="btn btn-dark full">Log in</button>
      </form>
      <p className="center-text small">New here? <Link to="/register" className="link">Create an account</Link></p>
      <div className="demo">
        <b>Demo accounts</b>
        {[['Customer', 'user@shopsphere.com', 'user123'], ['Seller', 'seller@shopsphere.com', 'seller123'], ['Admin', 'admin@shopsphere.com', 'admin123']].map(([l, email, password]) => (
          <button type="button" key={l} onClick={() => go(null, { email, password })}>{l}<small>{email}</small></button>
        ))}
      </div>
    </Shell>
  );
}

export function Register() {
  const { login } = useApp();
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const [role, setRole] = useState(sp.get('role') === 'seller' ? 'seller' : 'customer');
  const [f, setF] = useState({ name: '', email: '', password: '', storeName: '' });
  const [err, setErr] = useState('');
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { const r = await api('/auth/register', { method: 'POST', body: { ...f, role } }); login(r.token, r.user); nav(role === 'seller' ? '/seller' : '/', { replace: true }); }
    catch (ex) { setErr(ex.message); }
  };
  const s = (k) => ({ value: f[k], onChange: (e) => setF({ ...f, [k]: e.target.value }) });
  return (
    <Shell title={role === 'seller' ? 'Become a seller' : 'Create your account'} sub={role === 'seller' ? 'Open your store and start selling' : 'Join ShopSphere in a few seconds'}>
      <div className="seg"><button type="button" className={role === 'customer' ? 'on' : ''} onClick={() => setRole('customer')}>Shopper</button><button type="button" className={role === 'seller' ? 'on' : ''} onClick={() => setRole('seller')}>Seller</button></div>
      <form onSubmit={submit} className="stack">
        <label>Full name<input required {...s('name')} /></label>
        {role === 'seller' && <label>Store name<input required {...s('storeName')} /></label>}
        <label>Email<input type="email" required {...s('email')} /></label>
        <label>Password<input type="password" required minLength={6} {...s('password')} /></label>
        {err && <div className="alert">{err}</div>}
        <button className="btn btn-dark full">{role === 'seller' ? 'Create seller account' : 'Create account'}</button>
      </form>
      <p className="center-text small">Already have an account? <Link to="/login" className="link">Log in</Link></p>
    </Shell>
  );
}
