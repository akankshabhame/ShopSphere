import { Link } from 'react-router-dom';
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div><div className="logo small">ShopSphere</div><p>Everything you love, all in one place. Discover, shop and sell with confidence.</p></div>
        <div><h4>Shop</h4><Link to="/shop">All products</Link><Link to="/shop?tab=deals">Deals</Link><Link to="/shop?tab=new">New arrivals</Link></div>
        <div><h4>Account</h4><Link to="/profile">Profile</Link><Link to="/orders">Orders</Link><Link to="/wishlist">Wishlist</Link></div>
        <div><h4>Sell</h4><Link to="/register?role=seller">Become a seller</Link><Link to="/seller">Seller portal</Link></div>
      </div>
      <div className="copy">© {new Date().getFullYear()} ShopSphere. All rights reserved.</div>
    </footer>
  );
}
