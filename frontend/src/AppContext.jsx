import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api, setToken, getToken } from './api';

const Ctx = createContext();
export const useApp = () => useContext(Ctx);

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
export const snap = (p) => ({ id: p.id, name: p.name, subtitle: p.subtitle, price: p.price, mrp: p.mrp, image: p.image, emoji: p.emoji, stock: p.stock, category: p.category });

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [cart, setCart] = useState(() => read('ss_cart', []));        // [{ product, qty }]
  const [wishlist, setWishlist] = useState(() => read('ss_wish', [])); // [product]
  const [toast, setToast] = useState(null);
  const timer = useRef();

  const notify = useCallback((msg) => {
    setToast(msg); clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2200);
  }, []);

 
  const mergeFrom = (u) => {
    setCart((c) => {
      const m = [...(u.cart || [])];
      c.forEach((i) => { const e = m.find((x) => x.product.id === i.product.id); if (e) e.qty = Math.max(e.qty, i.qty); else m.push(i); });
      return m;
    });
    setWishlist((w) => {
      const m = [...(u.wishlist || [])];
      w.forEach((p) => { if (!m.find((x) => x.id === p.id)) m.push(p); });
      return m;
    });
  };

  useEffect(() => {
    if (!getToken()) { setReady(true); return; }
    api('/auth/me').then((r) => { setUser(r.user); mergeFrom(r.user); }).catch(() => setToken(null)).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    localStorage.setItem('ss_cart', JSON.stringify(cart));
    localStorage.setItem('ss_wish', JSON.stringify(wishlist));
    if (!user || !ready) return;
    const t = setTimeout(() => api('/me/sync', { method: 'PUT', body: { cart, wishlist } }).catch(() => {}), 600);
    return () => clearTimeout(t);
  }, [cart, wishlist, user, ready]);

  const login = (token, u) => { setToken(token); setUser(u); mergeFrom(u); };
  const logout = () => { setToken(null); setUser(null); setCart([]); setWishlist([]); };

  const addToCart = (p, qty = 1, silent) => {
    if (p.stock !== undefined && p.stock <= 0) return notify('Sorry, this item is out of stock');
    setCart((c) => {
      const e = c.find((i) => i.product.id === p.id);
      if (e) return c.map((i) => (i.product.id === p.id ? { ...i, qty: Math.min(i.qty + qty, p.stock || 99) } : i));
      return [...c, { product: snap(p), qty }];
    });
    if (!silent) notify('Added to cart 🛒');
  };
  const setQty = (id, qty) => setCart((c) => c.map((i) => (i.product.id === id ? { ...i, qty: Math.max(1, Math.min(qty, i.product.stock || 99)) } : i)));
  const removeFromCart = (id) => setCart((c) => c.filter((i) => i.product.id !== id));
  const clearCart = () => setCart([]);
  const inWish = (id) => wishlist.some((p) => p.id === id);
  const toggleWish = (p) => {
    if (inWish(p.id)) { setWishlist((w) => w.filter((x) => x.id !== p.id)); notify('Removed from wishlist'); }
    else { setWishlist((w) => [...w, snap(p)]); notify('Saved to wishlist ❤️'); }
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.product.price, 0);

  return (
    <Ctx.Provider value={{ user, setUser, ready, login, logout, cart, cartCount, cartTotal, addToCart, setQty, removeFromCart, clearCart, wishlist, inWish, toggleWish, notify }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </Ctx.Provider>
  );
}
