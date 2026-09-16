import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { farmers, mandiPriceHistory } from '../../data/mockData';
import { calculatePricing, MANDI_BENCHMARKS } from '../../utils/pricingEngine';
import PriceBreakdown from '../../components/PriceBreakdown/PriceBreakdown';
import { useToast } from '../../components/UI/Toast';
import './FarmerPortal.css';

export default function FarmerPortal() {
  const { currentFarmerId } = useApp();
  const { addToast } = useToast();
  const [farmerProducts, setFarmerProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');

  // New produce form state
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

  // Fetch listings from backend API
  const fetchFarmerProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:3001/api/products?farmerId=${activeFarmer.id}`);
      const json = await res.json();
      if (json.success && json.data.length > 0) {
        setFarmerProducts(json.data);
      } else {
        // Fallback fetch all products if farmer specific is empty
        const allRes = await fetch(`http://localhost:3001/api/products`);
        const allJson = await allRes.json();
        if (allJson.success) setFarmerProducts(allJson.data);
      }
    } catch (err) {
      console.warn('API unavailable, using initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmerProducts();
  }, [activeFarmer.id]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const farmPriceNum = Number(formData.farmPrice);
    if (!formData.cropName || !farmPriceNum || !formData.quantity) {
      addToast('Please fill in crop name, quantity, and price.', 'warning');
      return;
    }

    const payload = {
      farmerId: activeFarmer.id,
      farmerName: activeFarmer.name,
      cropName: formData.cropName,
      cropNameHi: formData.cropName,
      category: formData.category,
      variety: formData.variety || 'Standard',
      quantity: Number(formData.quantity),
      unit: formData.unit,
      farmPrice: farmPriceNum,
      grade: formData.grade,
      organic: formData.organic,
      harvestDate: formData.harvestDate,
      location: formData.location,
      description: formData.description || 'Fresh produce directly listed by farmer.',
    };

    try {
      const res = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        setFarmerProducts(prev => [json.data, ...prev]);
        addToast(`✅ Produce Listing Posted Live! ${payload.quantity}${payload.unit} ${payload.cropName}`, 'success');
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      // Local fallback if server unreachable
      const newListing = {
        id: `P${Date.now()}`,
        ...payload,
        available: true,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        ...calculatePricing(farmPriceNum, payload.cropName),
      };
      setFarmerProducts(prev => [newListing, ...prev]);
      addToast(`✅ Produce Listing Posted Locally!`, 'success');
    }

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

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:3001/api/products/${id}`, { method: 'DELETE' });
      setFarmerProducts(prev => prev.filter(p => p.id !== id));
      addToast('Listing removed successfully', 'info');
    } catch (err) {
      setFarmerProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Live pricing suggestion calculation for form
  const liveFormPricing = formData.farmPrice && formData.cropName
    ? calculatePricing(formData.farmPrice, formData.cropName)
    : null;

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
      </div>

      {/* Tab 1: Listings */}
      {activeTab === 'listings' && (
        <div className="portal-content">
          {loading ? (
            <div className="card card-body text-center p-5">⏳ Loading live farmer inventory...</div>
          ) : (
            <div className="table-container card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Farmer Payout</th>
                    <th>Platform Fee (8%)</th>
                    <th>Consumer Price</th>
                    <th>Mandi Rate</th>
                    <th>Grade</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {farmerProducts.map(p => {
                    const pricing = calculatePricing(p.farmPrice, p.cropName);
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.cropName}</strong>
                          <div className="text-xs text-secondary">{p.variety || 'Standard'}</div>
                        </td>
                        <td><span className="badge badge-gray">{p.category}</span></td>
                        <td><strong>{p.quantity} {p.unit}</strong></td>
                        <td><strong className="text-success">₹{p.farmPrice}/kg</strong></td>
                        <td className="text-secondary">+₹{pricing.platformFee}/kg</td>
                        <td><strong className="text-primary">₹{pricing.platformPrice}/kg</strong></td>
                        <td>₹{pricing.mandiPrice}/kg</td>
                        <td><span className="badge badge-amber">Grade {p.grade}</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(p.id)}>🗑️ Remove</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Price Intelligence */}
      {activeTab === 'mandi' && (
        <div className="portal-content">
          <div className="card card-body">
            <h3>📈 Mandi Price vs FarmDirect Direct Payout</h3>
            <p className="text-secondary">Comparing traditional Mandi rates (after agent 40% commission cuts) vs direct FarmDirect payout:</p>

            <div className="mandi-comparison-grid grid grid-3 gap-4" style={{ marginTop: '20px' }}>
              {Object.entries(MANDI_BENCHMARKS).map(([key, item]) => {
                const pricing = calculatePricing(item.mandiPrice * 1.2, item.crop);
                return (
                  <div key={key} className="card card-body">
                    <h4>{item.crop}</h4>
                    <div className="mandi-stat flex justify-between text-sm mt-1">
                      <span>Mandi Benchmark:</span>
                      <strong>₹{item.mandiPrice}/kg</strong>
                    </div>
                    <div className="mandi-stat flex justify-between text-sm mt-1">
                      <span>FarmDirect Payout:</span>
                      <strong className="text-success">₹{pricing.farmPrice}/kg</strong>
                    </div>
                    <div className="mandi-stat flex justify-between text-sm mt-1">
                      <span>Supermarket Retail:</span>
                      <span className="text-secondary strike">₹{item.avgRetail}/kg</span>
                    </div>
                    <div className="badge badge-green mt-2">
                      +₹{pricing.farmerBonusVsMandi}/kg (+{pricing.farmerBonusPercent}%) vs agent
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Produce Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2>🌾 Add Produce Listing (API Powered)</h2>
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
                  <label className="form-label">Farmer Payout Expected (₹/kg) *</label>
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

              {/* Real-Time Price Engine Helper Box */}
              {liveFormPricing && (
                <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div className="text-xs font-bold text-success">💡 Transparent Price Preview:</div>
                  <div className="grid grid-3 gap-2 mt-1 text-xs">
                    <div>Your Payout: <strong>₹{liveFormPricing.farmPrice}/kg</strong></div>
                    <div>Consumer Pays: <strong>₹{liveFormPricing.platformPrice}/kg</strong></div>
                    <div>Consumer Saves: <strong className="text-success">{liveFormPricing.consumerSavingPercent}%</strong></div>
                  </div>
                </div>
              )}

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
                  🚀 Publish Live Listing to Marketplace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
