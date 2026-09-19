import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './Footer.css';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer className="footer">
      <div className="container footer-inner grid grid-4 gap-8">
        <div>
          <div className="footer-logo">🌾 Farm<span>Direct</span></div>
          <p className="footer-desc">
            {t('ui.footer.desc')}
          </p>
        </div>

        <div>
          <h4>{t('ui.footer.modules')}</h4>
          <ul className="footer-links flex flex-col gap-2">
            <li><Link to="/marketplace">{t('nav.marketplace')}</Link></li>
            <li><Link to="/farmer">{t('nav.farmerPortal')}</Link></li>
            <li><Link to="/bulk-buyer">{t('nav.bulkBuyer')}</Link></li>
            <li><Link to="/analytics">{t('nav.analytics')}</Link></li>
            <li><Link to="/logistics">{t('nav.logistics')}</Link></li>
          </ul>
        </div>

        <div>
          <h4>{t('ui.footer.states')}</h4>
          <p className="text-xs text-secondary leading-relaxed">
            Maharashtra, Punjab, Karnataka, Uttar Pradesh, Kerala, Rajasthan, Andhra Pradesh, Tamil Nadu, Gujarat, Haryana, West Bengal, Madhya Pradesh.
          </p>
        </div>

        <div>
          <h4>{t('ui.footer.info')}</h4>
          <p className="text-xs text-secondary">
            Built for Academic / Panel Presentation & Demo.<br />
            Integrates ONDC & e-NAM standards for direct APMC bypass.
          </p>
          <div className="badge badge-green" style={{ marginTop: '12px' }}>
            v1.0.0 Full Functional Demo
          </div>
        </div>
      </div>
      <div className="footer-bottom text-center text-xs text-secondary">
        © 2026 FarmDirect Digital Agricultural Ecosystem. All rights reserved.
      </div>
    </footer>
  );
}
