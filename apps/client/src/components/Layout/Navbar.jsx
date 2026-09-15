import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { t, theme, toggleTheme, language, toggleLanguage } = useApp();
  const { totalItems, toggleCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isHome && !scrolled ? 'transparent' : ''}`} id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-logo" id="logo-link">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">
            Farm<span className="logo-highlight">Direct</span>
          </span>
        </Link>

        <div className="navbar-links">
          <Link to="/marketplace" className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`} id="nav-marketplace">
            {t('nav.marketplace')}
          </Link>
          <Link to="/farmer" className={`nav-link ${location.pathname.startsWith('/farmer') ? 'active' : ''}`} id="nav-farmer">
            {t('nav.farmerPortal')}
          </Link>
          <Link to="/bulk-buyer" className={`nav-link ${location.pathname.startsWith('/bulk') ? 'active' : ''}`} id="nav-bulk">
            {t('nav.bulkBuyer')}
          </Link>
          <Link to="/analytics" className={`nav-link ${location.pathname.startsWith('/analytics') ? 'active' : ''}`} id="nav-analytics">
            {t('nav.analytics')}
          </Link>
          <Link to="/logistics" className={`nav-link ${location.pathname.startsWith('/logistics') ? 'active' : ''}`} id="nav-logistics">
            {t('nav.logistics')}
          </Link>
        </div>

        <div className="navbar-actions">
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
