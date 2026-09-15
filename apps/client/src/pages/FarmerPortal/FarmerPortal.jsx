import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { products as initialProducts, farmers, mandiPriceHistory, formatCurrency } from '../../data/mockData';
import './FarmerPortal.css';

export default function FarmerPortal() {
  const { currentFarmerId, language } = useApp();
  const [farmerProducts, setFarmerProducts] = useState(
    initialProducts.filter(p => p.farmerId === currentFarmerId || p.farmerId === 'F001')
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');

  // New produce form state (fulfilling Module 1 requirement)
  const [formData, setFormData] = useState({
    cropName: '',
    category: 'vegetables',
    variety: '',
    quantity: '',
    unit: 'kg',
    farmPrice: '',
    harvestDate: new Date().toISOString().split('T')[0],
    location: 'Nashik, Maharashtra',
    grade: 'A',
    description: '',
    organic: false,
  });

  const activeFarmer = farmers.find(f => f.id === currentFarmerId) || farmers[0];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const farmPriceNum = Number(formData.farmPrice);
    const newListing = {
      id: `P${Date.now()}`,
      farmerId: activeFarmer.id,
      farmerName: activeFarmer.name,
      cropName: formData.cropName,
      cropNameHi: formData.cropName,
      category: formData.category,
      variety: formData.variety || 'Standard',
      quantity: Number(formData.quantity),
      unit: formData.unit,
      farmPrice: farmPriceNum,
      platformPrice: Math.round(farmPriceNum * 1.25),
      retailPrice: Math.round(farmPriceNum * 2.1),
      mandiPrice: Math.round(farmPriceNum * 1.15),
      grade: formData.grade,
      organic: formData.organic,
      harvestDate: formData.harvestDate,
      location: formData.location,
      available: true,
      rating: 5.0,
      description: formData.description || 'Fresh produce directly listed by farmer.',
    };

    setFarmerProducts([newListing, ...farmerProducts]);
    setShowAddModal(false);
    // Reset form
    setFormData({
      cropName: '',
      category: 'vegetables',
      variety: '',
      quantity: '',
      unit: 'kg',
      farmPrice: '',
      harvestDate: new Date().toISOString().split('T')[0],
      location: 'Nashik, Maharashtra',
      grade: 'A',
      description: '',
      organic: false,
    });
  };

  return (
    <div className="farmer-portal container">
      {/* Header */}
      <div className="farmer-header flex justify-between items-center">
        <div>
          <span className="badge badge-green">🧑‍🌾 Verified Farmer & FPO Hub</span>
          <h1 className="farmer-title">{activeFarmer.name}</h1>
          <p className="text-secondary">📍 {activeFarmer.village}, {activeFarmer.district} ({activeFarmer.state}) • Rating: ⭐ {activeFarmer.rating}</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowAddModal(true)} id="add-produce-btn">
          ➕ Post Produce Listing
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-4 gap-4 stats-row">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7', color: '#16a34a' }}>💰</div>
          <div>
            <div className="stat-value">₹1,84,500</div>
            <div className="stat-label">Total Earnings (This Month)</div>
            <span className="stat-change positive">↑ +38% vs Mandi</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>📦</div>
          <div>
            <div className="stat-value">{farmerProducts.length}</div>
            <div className="stat-label">Active Crop Listings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>🚚</div>
          <div>
            <div className="stat-value">12</div>
            <div className="stat-label">Direct Orders Processing</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>🤝</div>
          <div>
            <div className="stat-value">8,500</div>
            <div className="stat-label">FPO Collective Members</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginTop: '32px' }}>
        <button className={`tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}>
          🌾 Active Produce Listings ({farmerProducts.length})
        </button>
        <button className={`tab ${activeTab === 'mandi' ? 'active' : ''}`} onClick={() => setActiveTab('mandi')}>
          📊 Mandi vs Platform Price Intelligence
        </button>
        <button className={`tab ${activeTab === 'fpo' ? 'active' : ''}`} onClick={() => setActiveTab('fpo')}>
          🤝 FPO Group Inventory Aggregation
        </button>
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="portal-content">
          <div className="table-container card">
            <table className="table">
              <thead>
                <tr>
                  <th>Crop</th>
                  <th>Category</th>
                  <th>Quantity</th>
                  <th>Farmer Price</th>
                  <th>Mandi Rate</th>
                  <th>Retail Rate</th>
                  <th>Grade</th>
                  <th>Harvest Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {farmerProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.cropName}</strong>
                      <div className="text-xs text-secondary">{p.variety}</div>
                    </td>
                    <td><span className="badge badge-gray">{p.category}</span></td>
                    <td><strong>{p.quantity} {p.unit}</strong></td>
                    <td><strong className="text-success">₹{p.farmPrice}/kg</strong></td>
                    <td>₹{p.mandiPrice}/kg</td>
                    <td className="text-secondary" style={{ textDecoration: 'line-through' }}>₹{p.retailPrice}/kg</td>
                    <td><span className="badge badge-amber">Grade {p.grade}</span></td>
                    <td>{p.harvestDate}</td>
                    <td><span className="badge badge-green">Live Listing</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Price Intelligence */}
      {activeTab === 'mandi' && (
        <div className="portal-content">
          <div className="card card-body">
            <h3>📈 Price Comparison Analysis</h3>
            <p className="text-secondary">Comparing Mandi prices vs FarmDirect farmer payout per crop:</p>

            <div className="mandi-comparison-grid grid grid-3 gap-4" style={{ marginTop: '20px' }}>
              {Object.entries(mandiPriceHistory).map(([key, item]) => (
                <div key={key} className="card card-body">
                  <h4>{item.name}</h4>
                  <div className="mandi-stat">
                    <span>Mandi Benchmark:</span>
                    <strong>₹{item.mandiPrices[item.mandiPrices.length - 1]}/kg</strong>
                  </div>
                  <div className="mandi-stat">
                    <span>FarmDirect Farmer Rate:</span>
                    <strong className="text-success">₹{item.farmerPrices[item.farmerPrices.length - 1]}/kg</strong>
                  </div>
                  <div className="mandi-stat">
                    <span>Consumer Retail:</span>
                    <span className="text-secondary">₹{item.retailPrices[item.retailPrices.length - 1]}/kg</span>
                  </div>
                  <div className="badge badge-green" style={{ marginTop: '8px' }}>
                    +35% extra profit for farmer
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Produce Modal (Module 1 Requirement) */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🌾 Add Produce Listing (Module 1)</h2>
              <button className="cart-close-btn" onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body flex flex-col gap-4">
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Crop / Product Name *</label>
                  <input
                    type="text"
                    name="cropName"
                    required
                    placeholder="e.g. Tomato, Onion, Turmeric"
                    className="form-input"
                    value={formData.cropName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains & Cereals</option>
                    <option value="pulses">Pulses</option>
                    <option value="spices">Spices</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Quantity Available *</label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="1"
                    placeholder="e.g. 500"
                    className="form-input"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit *</label>
                  <select name="unit" className="form-select" value={formData.unit} onChange={handleInputChange}>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="ton">Tons</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Expected Price per kg (₹) *</label>
                  <input
                    type="number"
                    name="farmPrice"
                    required
                    min="1"
                    placeholder="e.g. 30"
                    className="form-input"
                    value={formData.farmPrice}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Quality Grade *</label>
                  <select name="grade" className="form-select" value={formData.grade} onChange={handleInputChange}>
                    <option value="A">Grade A (Premium Export Quality)</option>
                    <option value="B">Grade B (Standard Market Quality)</option>
                    <option value="C">Grade C (Processing Quality)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Harvest Date *</label>
                  <input
                    type="date"
                    name="harvestDate"
                    required
                    className="form-input"
                    value={formData.harvestDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Farm Location *</label>
                  <input
                    type="text"
                    name="location"
                    required
                    placeholder="District, State"
                    className="form-input"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ padding: 0, marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-listing-btn">
                  Publish Produce Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
