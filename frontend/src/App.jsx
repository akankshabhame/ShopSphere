import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from './AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Cart from './pages/Cart.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Checkout from './pages/Checkout.jsx';
import { Orders, OrderTracking } from './pages/Orders.jsx';
import Profile from './pages/Profile.jsx';
import { Login, Register } from './pages/Auth.jsx';
import Seller from './pages/Seller.jsx';
import Admin from './pages/Admin.jsx';

function Guard({ roles, children }) {
  const { user, ready } = useApp();
  const loc = useLocation();
  if (!ready) return <div className="center-msg">Loading…</div>;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname + loc.search }} replace />;
  if (roles && !roles.includes(user.role)) return <div className="center-msg"><h2>Access denied</h2><p>Your account can't open this page.</p></div>;
  return children;
}

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => {
  window.scrollTo(0, 0);
}, [pathname]);
  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
          <Route path="/orders" element={<Guard><Orders /></Guard>} />
          <Route path="/orders/:id" element={<Guard><OrderTracking /></Guard>} />
          <Route path="/profile" element={<Guard><Profile /></Guard>} />
          <Route path="/seller" element={<Guard roles={['seller', 'admin']}><Seller /></Guard>} />
          <Route path="/admin" element={<Guard roles={['admin']}><Admin /></Guard>} />
          <Route path="*" element={<div className="center-msg"><h2>404</h2><p>That page doesn't exist.</p></div>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
