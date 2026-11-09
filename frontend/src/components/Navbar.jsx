import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Heart, ShoppingCart, ChevronDown, User, Package, LogOut, LayoutDashboard, Shield } from 'lucide-react';
import { useApp } from '../AppContext.jsx';
import { api } from '../api';

export default function Navbar() {
  const { user, logout, cartCount, wishlist } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [open, setOpen] = useState(null); // 'cats' | 'user'

  useEffect(() => { api('/products/categories').then(setCats).catch(() => {}); }, []);
  useEffect(() => { const c = () => setOpen(null); window.addEventListener('click', c); return () => window.removeEventListener('click', c); }, []);

  const submit = (e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); };
  const toggle = (name) => (e) => { e.stopPropagation(); setOpen(open === name ? null : name); };

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="logo"><ShoppingBag size={30} strokeWidth={1.6} /> ShopSphere</Link>
        <nav className="nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/shop" end>Shop</NavLink>
          <div className="dropdown-wrap">
            <button className="nav-btn" onClick={toggle('cats')}>Categories <ChevronDown size={15} /></button>
            {open === 'cats' && (
              <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                {cats.map((c) => <Link key={c.name} to={`/shop?category=${encodeURIComponent(c.name)}`} onClick={() => setOpen(null)}>{c.name}</Link>)}
              </div>
            )}
          </div>
          <Link to="/shop?tab=deals">Deals</Link>
          <Link to={user && user.role !== 'customer' ? '/seller' : '/register?role=seller'}>Seller Portal</Link>
        </nav>
        <form className="search" onSubmit={submit}>
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products, brands and more…" />
        </form>
        <div className="nav-icons">
          <Link to="/wishlist" className="icon-btn" aria-label="Wishlist"><Heart size={24} strokeWidth={1.7} />{wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}</Link>
          <Link to="/cart" className="icon-btn" aria-label="Cart"><ShoppingCart size={24} strokeWidth={1.7} />{cartCount > 0 && <span className="badge">{cartCount}</span>}</Link>
          {user ? (
            <div className="dropdown-wrap">
              <button className="avatar-btn" onClick={toggle('user')}><span className="avatar">{user.name[0].toUpperCase()}</span><ChevronDown size={15} /></button>
              {open === 'user' && (
                <div className="dropdown right" onClick={(e) => e.stopPropagation()}>
                  <div className="dd-head">{user.name}<small>{user.role}</small></div>
                  <Link to="/profile" onClick={() => setOpen(null)}><User size={15} /> My Profile</Link>
                  <Link to="/orders" onClick={() => setOpen(null)}><Package size={15} /> My Orders</Link>
                  {(user.role === 'seller' || user.role === 'admin') && <Link to="/seller" onClick={() => setOpen(null)}><LayoutDashboard size={15} /> Seller Dashboard</Link>}
                  {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(null)}><Shield size={15} /> Admin Dashboard</Link>}
                  <button onClick={() => { logout(); setOpen(null); nav('/'); }}><LogOut size={15} /> Logout</button>
                </div>
              )}
            </div>
          ) : <Link to="/login" className="btn btn-dark btn-sm">Login</Link>}
        </div>
      </div>
    </header>
  );
}
