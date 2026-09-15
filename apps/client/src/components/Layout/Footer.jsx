import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner grid grid-4 gap-8">
        <div>
          <div className="footer-logo">🌾 Farm<span>Direct</span></div>
          <p className="footer-desc">
            Direct digital marketplace connecting Indian farmers & FPOs with buyers. Eliminating intermediaries, maximizing farmer payouts, and providing AI-driven logistics.
          </p>
        </div>

        <div>
          <h4>Platform Modules</h4>
          <ul className="footer-links flex flex-col gap-2">
            <li><Link to="/marketplace">Consumer Marketplace</Link></li>
            <li><Link to="/farmer">Farmer / FPO Portal</Link></li>
            <li><Link to="/bulk-buyer">Bulk Buyer & RFQs</Link></li>
            <li><Link to="/analytics">AI Demand Forecasting</Link></li>
            <li><Link to="/logistics">Cold-Chain Route Map</Link></li>
          </ul>
        </div>

        <div>
          <h4>Supported States</h4>
          <p className="text-xs text-secondary leading-relaxed">
            Maharashtra, Punjab, Karnataka, Uttar Pradesh, Kerala, Rajasthan, Andhra Pradesh, Tamil Nadu, Gujarat, Haryana, West Bengal, Madhya Pradesh.
          </p>
        </div>

        <div>
          <h4>Project Information</h4>
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
