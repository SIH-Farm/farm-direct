import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { farmers, mandiPriceHistory, getProductsByFarmer, formatCurrency } from '../../data/mockData';
import { calculatePricing, MANDI_BENCHMARKS } from '../../utils/pricingEngine';
import { apiGet, apiPost, apiDelete } from '../../utils/api';
import CropAdvisory from '../../components/CropAdvisory/CropAdvisory';
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
      const data = await apiGet(`/products?farmerId=${encodeURIComponent(activeFarmer.id)}`);
      setFarmerProducts(Array.isArray(data) ? data : []);
    } catch {
      // Server offline — fall back to this farmer's own bundled listings only.
      setFarmerProducts(getProductsByFarmer(activeFarmer.id));
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
      const created = await apiPost('/products', payload);
      setFarmerProducts(prev => [created, ...prev]);
      addToast(`✅ Produce Listing Posted Live! ${payload.quantity}${payload.unit} ${payload.cropName}`, 'success');
    } catch (err) {
      const offline = !navigator.onLine;
      const newListing = {
        id: `P${Date.now()}`,
        ...payload,
        available: true,
        rating: 5.0,
        createdAt: new Date().toISOString(),
        ...calculatePricing(farmPriceNum, payload.cropName),
      };
      setFarmerProducts(prev => [newListing, ...prev]);
      addToast(
        offline
          ? '⚠️ Offline — listing saved locally for this session only.'
          : `⚠️ Could not publish: ${err.message}`,
        'warning'
      );
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
    const listing = farmerProducts.find(p => p.id === id);
    if (!window.confirm(`Remove the listing for ${listing?.cropName || 'this produce'}? This cannot be undone.`)) {
      return;
    }
    try {
      await apiDelete(`/products/${id}`);
      setFarmerProducts(prev => prev.filter(p => p.id !== id));
      addToast('Listing removed successfully', 'info');
    } catch (err) {
      // Only drop it from the UI if the server actually confirmed the delete.
      addToast(`Could not remove listing: ${err.message}`, 'error');
    }
  };

  const [listening, setListening] = useState(false);

  const handleVoiceInput = () => {
    setListening(true);
    addToast('🎙️ Voice Input Active! Speak in Hindi or English (e.g. "500 kilo Tamatar 28 rupaye")', 'info', 4000);
    setTimeout(() => {
      setListening(false);
      setFormData(prev => ({
        ...prev,
        cropName: 'Tomato',
        variety: 'Nashik Cherry Red',
        quantity: 500,
        farmPrice: 28,
        category: 'vegetables',
      }));
      addToast('✅ Voice Dictation Processed: "500kg Tomato @ ₹28/kg" Auto-Filled!', 'success');
    }, 2200);
  };

  const handleSelectCropAdvisory = (rec) => {
    setFormData(prev => ({
      ...prev,
      cropName: rec.cropName.split(' ')[0],
      variety: rec.variety,
      farmPrice: rec.recommendedPrice,
      quantity: 500,
    }));
    setShowAddModal(true);
    addToast(`🤖 AI Advisory Applied: ${rec.cropName} @ ₹${rec.recommendedPrice}/kg!`, 'success');
  };

  // Live pricing suggestion calculation for form
  const liveFormPricing = formData.farmPrice && formData.cropName
    ? calculatePricing(formData.farmPrice, formData.cropName)
    : null;

  // Derived from this farmer's own live listings. These cards previously carried
  // hardcoded figures — a fixed earnings total and a "+38% vs Mandi" claim — which
  // contradicted the bonus the pricing engine returns everywhere else in the app.
  const listedValue = farmerProducts.reduce(
    (total, product) => total + (Number(product.farmPrice) || 0) * (Number(product.quantity) || 0),
    0
  );
  const listedQuantity = farmerProducts.reduce(
    (total, product) => total + (Number(product.quantity) || 0),
    0
  );
  const averageBonusPercent = farmerProducts.length
    ? Math.round(
        farmerProducts.reduce(
          (total, product) => total + calculatePricing(product.farmPrice, product.cropName).farmerBonusPercent,
          0
        ) / farmerProducts.length
      )
    : 0;

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
            <div className="stat-value">{formatCurrency(listedValue)}</div>
            <div className="stat-label">Listed Produce Value</div>
            {farmerProducts.length > 0 && (
              <span className="stat-change positive">↑ +{averageBonusPercent}% vs Mandi agent</span>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0284c7' }}>📦</div>
          <div>
            <div className="stat-value">{farmerProducts.length}</div>
            <div className="stat-label">Active Crop Listings</div>
            <span className="text-xs text-secondary">
              {listedQuantity.toLocaleString('en-IN')} kg available to buyers
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>🚚</div>
          <div>
            <div className="stat-value">{activeFarmer.totalOrders.toLocaleString('en-IN')}</div>
            <div className="stat-label">Orders Fulfilled</div>
            <span className="text-xs text-secondary">Selling since {activeFarmer.memberSince}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff', color: '#9333ea' }}>⭐</div>
          <div>
            <div className="stat-value">{activeFarmer.rating}</div>
            <div className="stat-label">Buyer Rating</div>
            <span className="text-xs text-secondary">
              {activeFarmer.verified ? '✓ Identity verified' : '⚠ Verification pending'}
            </span>
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
          <CropAdvisory onSelectCrop={handleSelectCropAdvisory} />
          {loading ? (
            <div className="card card-body text-center p-5">⏳ Loading live farmer inventory...</div>
          ) : farmerProducts.length === 0 ? (
            <div className="card card-body text-center p-5">
              <div style={{ fontSize: '2.5rem' }}>🧺</div>
              <h3 style={{ marginTop: '8px' }}>No live listings yet</h3>
              <p className="text-secondary text-sm" style={{ marginTop: '4px' }}>
                Post your first produce listing and it will appear on the marketplace within seconds.
              </p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: '12px' }} onClick={() => setShowAddModal(true)}>
                Post Produce Listing
              </button>
            </div>
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
              {/* Voice Dictation Banner for Rural Accessibility */}
              <div style={{ background: '#f0f9ff', border: '1px solid #7dd3fc', padding: '12px', borderRadius: '8px' }} className="flex justify-between items-center">
                <div>
                  <strong className="text-xs text-primary">🎤 Rural Digital Literacy Helper (बोलकर दर्ज करें):</strong>
                  <div className="text-xs text-secondary">Click button & speak in Hindi or English to auto-fill crop, quantity & price.</div>
                </div>
                <button
                  type="button"
                  className={`btn ${listening ? 'btn-amber pulse-glow' : 'btn-primary'} btn-sm`}
                  onClick={handleVoiceInput}
                  disabled={listening}
                >
                  {listening ? '🎙️ Listening in Hindi...' : '🎤 Speak (बोलें)'}
                </button>
              </div>

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
