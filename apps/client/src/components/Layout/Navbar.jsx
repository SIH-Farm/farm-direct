import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

// Permitted routes per role
const ROLE_PAGES = {
  consumer: [
    { path: '/marketplace', labelKey: 'nav.marketplace', icon: '🛒' },
  ],
  farmer: [
    { path: '/farmer', labelKey: 'nav.farmerPortal', icon: '🌾' },
  ],
  bulk_buyer: [
    { path: '/marketplace', labelKey: 'nav.marketplace', icon: '🛒' },
    { path: '/bulk-buyer', labelKey: 'nav.bulkBuyer', icon: '📦' },
  ],
  admin: [
    { path: '/marketplace', labelKey: 'nav.marketplace', icon: '🛒' },
    { path: '/farmer', labelKey: 'nav.farmerPortal', icon: '🌾' },
    { path: '/bulk-buyer', labelKey: 'nav.bulkBuyer', icon: '📦' },
    { path: '/analytics', labelKey: 'nav.analytics', icon: '📊' },
    { path: '/logistics', labelKey: 'nav.logistics', icon: '🚚' },
  ],
};

export default function Navbar({ onOpenTracker }) {
  const { t, theme, toggleTheme, language, toggleLanguage, currentRole, setCurrentRole } = useApp();
  const { totalItems, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';
  const visiblePages = ROLE_PAGES[currentRole] || ROLE_PAGES.admin;

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'transparent' : ''}`} id="main-navbar">
      <div className="navbar-inner container flex justify-between items-center">
        <Link to="/" className="navbar-logo" id="logo-link">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">
            Farm<span className="logo-highlight">Direct</span>
          </span>
        </Link>

        {/* Dynamic Navigation Links according to Active Role */}
        <div className="navbar-links">
          {visiblePages.map(page => (
            <Link
              key={page.path}
              to={page.path}
              className={`nav-link ${location.pathname === page.path ? 'active' : ''}`}
              id={`nav-${page.path.replace('/', '') || 'home'}`}
            >
              <span style={{ marginRight: '4px' }}>{page.icon}</span> {t(page.labelKey)}
            </Link>
          ))}
        </div>

        {/* Controls: Role Selector, Tracker, Lang, Theme, Cart */}
        <div className="flex items-center gap-3">
          <button
            className="btn btn-secondary btn-sm flex items-center gap-1"
            onClick={onOpenTracker}
            title="Track active orders & supply chain"
            id="track-orders-btn"
          >
            🚚 <span className="hidden-mobile">Track Orders</span>
          </button>

          <div className="role-switcher" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="text-xs text-secondary font-medium hidden-mobile">Role:</span>
            <select
              className="role-select"
              value={currentRole}
              onChange={(e) => {
                const role = e.target.value;
                setCurrentRole(role);
                if (role === 'farmer') navigate('/farmer');
                if (role === 'consumer') navigate('/marketplace');
                if (role === 'bulk_buyer') navigate('/bulk-buyer');
                if (role === 'admin') navigate('/analytics');
              }}
              title="Switch user role for hackathon demo"
              id="role-selector"
            >
              <option value="consumer">🛒 Consumer</option>
              <option value="farmer">🧑‍🌾 Farmer / FPO</option>
              <option value="bulk_buyer">📦 Bulk Buyer</option>
              <option value="admin">📊 Admin All Access</option>
            </select>
          </div>

          <button className="nav-btn lang-toggle" onClick={toggleLanguage} id="lang-toggle" title="Switch language">
            {language === 'en' ? 'हि' : 'EN'}
          </button>

          <button className="nav-btn theme-toggle" onClick={toggleTheme} id="theme-toggle" title="Toggle dark mode">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <button className="nav-btn cart-btn" onClick={toggleCart} id="cart-toggle">
            🛒
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
