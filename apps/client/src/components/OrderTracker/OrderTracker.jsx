import React, { useState } from 'react';
import './OrderTracker.css';

const DEMO_ORDERS = [
  {
    id: 'ORD-8942',
    cropName: 'Cherry Tomatoes',
    farmerName: 'Rajesh Patil',
    farmerLocation: 'Sinnar, Nashik (MH)',
    quantity: '20 kg',
    totalPrice: 540,
    farmerPayout: 500,
    platformFee: 40,
    orderDate: 'Today, 2:30 PM',
    statusStep: 3, // 1: Placed, 2: Quality Checked, 3: In Transit, 4: Delivered
    driverName: 'Ramesh Shinde',
    vehicleNo: 'MH-15-EV-4029',
    coldTemp: '4.2°C (Optimal)',
    eta: 'Today by 6:00 PM',
  },
  {
    id: 'ORD-7611',
    cropName: 'Sharbati Wheat',
    farmerName: 'Gurpreet Singh',
    farmerLocation: 'Ajnala, Amritsar (PB)',
    quantity: '50 kg',
    totalPrice: 1512,
    farmerPayout: 1400,
    platformFee: 112,
    orderDate: 'Yesterday',
    statusStep: 4,
    driverName: 'Harpreet Gill',
    vehicleNo: 'PB-02-TR-9912',
    coldTemp: 'Ambient Dry',
    eta: 'Delivered',
  },
];

export default function OrderTracker({ isOpen, onClose }) {
  const [selectedOrder, setSelectedOrder] = useState(DEMO_ORDERS[0]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal order-tracker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge badge-green">🚚 Real-Time Logistics Tracking</span>
            <h2 className="mt-1">My Orders & Direct Supply Chain Tracker</h2>
          </div>
          <button className="cart-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body flex gap-4">
          {/* Order Selection Sidebar */}
          <div className="order-list-sidebar flex flex-col gap-2" style={{ width: '220px', borderRight: '1px solid var(--border-color)', paddingRight: '12px' }}>
            <span className="text-xs text-secondary font-bold mb-1">SELECT ORDER</span>
            {DEMO_ORDERS.map(ord => (
              <div
                key={ord.id}
                className={`order-item-card p-2 rounded cursor-pointer ${selectedOrder.id === ord.id ? 'active-order' : ''}`}
                onClick={() => setSelectedOrder(ord)}
                style={{
                  background: selectedOrder.id === ord.id ? 'var(--bg-input)' : 'transparent',
                  border: selectedOrder.id === ord.id ? '1px solid #16a34a' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              >
                <div className="text-xs font-bold">{ord.id}</div>
                <div className="text-sm font-semibold">{ord.cropName} ({ord.quantity})</div>
                <div className="text-xs text-secondary">₹{ord.totalPrice} • {ord.statusStep === 4 ? '✅ Delivered' : '🚚 In Transit'}</div>
              </div>
            ))}
          </div>

          {/* Active Order Progress View */}
          <div className="order-detail-view flex-1">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{selectedOrder.cropName} ({selectedOrder.quantity})</h3>
                <p className="text-xs text-secondary">Order #{selectedOrder.id} • Purchased on {selectedOrder.orderDate}</p>
              </div>
              <span className="badge badge-amber font-bold">
                {selectedOrder.statusStep === 4 ? '✅ Delivered' : `ETA: ${selectedOrder.eta}`}
              </span>
            </div>

            {/* Step Progress Bar */}
            <div className="step-tracker-container my-4">
              <div className="step-line"></div>
              <div className="steps-row flex justify-between">
                {/* Step 1 */}
                <div className={`step-node ${selectedOrder.statusStep >= 1 ? 'completed' : ''}`}>
                  <div className="step-icon">📝</div>
                  <div className="step-label">Order Placed</div>
                  <div className="step-time">Direct to Farmer</div>
                </div>

                {/* Step 2 */}
                <div className={`step-node ${selectedOrder.statusStep >= 2 ? 'completed' : ''}`}>
                  <div className="step-icon">🔬</div>
                  <div className="step-label">Quality Audit</div>
                  <div className="step-time">Grade A Certified</div>
                </div>

                {/* Step 3 */}
                <div className={`step-node ${selectedOrder.statusStep >= 3 ? 'completed' : ''}`}>
                  <div className="step-icon">🚚</div>
                  <div className="step-label">Cold Transit</div>
                  <div className="step-time">IoT Monitored</div>
                </div>

                {/* Step 4 */}
                <div className={`step-node ${selectedOrder.statusStep >= 4 ? 'completed' : ''}`}>
                  <div className="step-icon">🏠</div>
                  <div className="step-label">Delivered</div>
                  <div className="step-time">Fresh Harvest</div>
                </div>
              </div>
            </div>

            {/* Live Telemetry & Payout Proof Card */}
            <div className="telemetry-card grid grid-2 gap-3 p-3 mt-4" style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <div className="text-xs text-secondary font-bold">🧑‍🌾 PRODUCER PAYOUT DETAILS</div>
                <div className="text-sm font-semibold mt-1">{selectedOrder.farmerName}</div>
                <div className="text-xs text-secondary">📍 {selectedOrder.farmerLocation}</div>
                <div className="text-xs text-success font-bold mt-1">
                  💰 Direct Bank Transfer: ₹{selectedOrder.farmerPayout} (Zero Middlemen Cuts)
                </div>
              </div>

              <div>
                <div className="text-xs text-secondary font-bold">❄️ SMART COLD-CHAIN TELEMETRY</div>
                <div className="text-sm font-semibold mt-1">Driver: {selectedOrder.driverName}</div>
                <div className="text-xs text-secondary">Vehicle: {selectedOrder.vehicleNo}</div>
                <div className="text-xs text-primary font-bold mt-1">
                  🌡️ Temp: {selectedOrder.coldTemp}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
