import React from 'react';
import { products, farmers } from '../../data/mockData';
import './BulkBuyer.css';

export default function BulkBuyer() {
  const fpos = farmers.filter(f => f.type === 'fpo');

  return (
    <div className="bulk-buyer-page container">
      <div className="bulk-header text-center">
        <span className="badge badge-amber">🏭 Bulk Buyer & Processor Hub</span>
        <h1 className="page-title">FPO Direct Procurement & Bidding</h1>
        <p className="page-subtitle">
          Direct contract farming, bulk order bidding, and quality assurance certificates for hotels, supermarkets, and food processors.
        </p>
      </div>

      <div className="grid grid-2 gap-6" style={{ marginTop: '32px' }}>
        {/* Active FPOs */}
        <div className="card card-body">
          <h3>🤝 Registered FPO Collectives</h3>
          <p className="text-sm text-secondary">Aggregate produce pool from over 20,000 farmers across Maharashtra, Punjab & Kerala</p>

          <div className="fpo-list flex flex-col gap-4" style={{ marginTop: '16px' }}>
            {fpos.map(fpo => (
              <div key={fpo.id} className="fpo-card card card-body">
                <div className="flex justify-between items-center">
                  <h4>{fpo.name}</h4>
                  <span className="badge badge-green">Verified FPO</span>
                </div>
                <p className="text-xs text-secondary">📍 {fpo.district}, {fpo.state} • 👥 {fpo.memberCount} Farmer Members</p>
                <div className="fpo-crops flex gap-2" style={{ marginTop: '8px' }}>
                  {fpo.crops.map(c => (
                    <span key={c} className="badge badge-gray">{c}</span>
                  ))}
                </div>
                <button className="btn btn-secondary btn-sm" style={{ marginTop: '12px' }} onClick={() => alert(`RFQ sent to ${fpo.name}`)}>
                  📝 Request Bulk Quote (RFQ)
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Contract Farming Request */}
        <div className="card card-body">
          <h3>📜 Post Contract Farming Request</h3>
          <p className="text-sm text-secondary">Lock in seasonal crop supply directly with FPOs at guaranteed forward prices.</p>

          <form className="flex flex-col gap-4" style={{ marginTop: '16px' }} onSubmit={(e) => { e.preventDefault(); alert('🎉 Contract farming request broadcasted to all matched FPOs!'); }}>
            <div className="form-group">
              <label className="form-label">Required Crop / Commodity</label>
              <input type="text" required placeholder="e.g. Sharbati Wheat, Guntur Chilli, Cherry Tomato" className="form-input" />
            </div>

            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Required Volume (Tons)</label>
                <input type="number" required placeholder="e.g. 50" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Target Month</label>
                <input type="month" required className="form-input" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Quality Certificate Requirement</label>
              <select className="form-select">
                <option>Grade A Export Standard (NABL Accredited)</option>
                <option>Organic Certified (APEDA / India Organic)</option>
                <option>Standard Processing Grade</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" id="submit-rfq-btn">
              Broadcast RFQ to FPOs
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
