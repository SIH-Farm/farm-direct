import React, { useState, useEffect } from 'react';
import { apiGet } from '../../utils/api';
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

/**
 * Normalises a server order (or a bundled demo order) into the shape this screen renders,
 * so live orders and fallback demo orders use one single code path.
 */
export function toOrderViewModel(order) {
  if (!order) return null;
  const items = Array.isArray(order.items) ? order.items : [];
  const first = items[0];

  return {
    id: order.id,
    cropName: items.length ? items.map(i => i.cropName).join(', ') : (order.cropName || 'Farm produce'),
    farmerName: order.farmerName || first?.farmerName || 'FarmDirect Farmer',
    farmerLocation: order.farmerLocation || first?.farmerLocation || order.location || 'India',
    quantity: items.length
      ? items.map(i => `${i.quantity}${i.unit || 'kg'}`).join(', ')
      : (order.quantity || ''),
    totalPrice: order.totalAmount ?? order.totalPrice ?? 0,
    farmerPayout: order.farmerPayout ?? 0,
    platformFee: order.platformFee ?? 0,
    orderDate: order.orderDate || '',
    statusStep: Number.isFinite(order.statusStep) ? order.statusStep : 1,
    driverName: order.driverName || null,
    vehicleNo: order.vehicleNo || null,
    coldTemp: order.coldTemp || null,
    eta: order.eta || (order.status === 'delivered' ? 'Delivered' : 'Dispatch being assigned'),
  };
}

export default function OrderTracker({ isOpen, onClose, order }) {
  const [orders, setOrders] = useState(() => DEMO_ORDERS.map(toOrderViewModel));
  const [selectedId, setSelectedId] = useState(DEMO_ORDERS[0].id);

  // Load real orders whenever the tracker opens; fall back to the bundled demo
  // orders so the screen is never empty during a demo.
  useEffect(() => {
    if (!isOpen) return undefined;

    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet('/orders');
        if (cancelled || !Array.isArray(data) || data.length === 0) return;
        const live = data.map(toOrderViewModel).filter(Boolean);
        setOrders(live);
        setSelectedId(prev => (live.some(o => o.id === prev) ? prev : live[0].id));
      } catch {
        // API offline — keep the bundled demo orders.
      }
    })();

    return () => { cancelled = true; };
  }, [isOpen]);

  // The order the buyer just paid for always takes priority.
  useEffect(() => {
    const placed = toOrderViewModel(order);
    if (!placed) return;
    setOrders(prev => [placed, ...prev.filter(o => o.id !== placed.id)]);
    setSelectedId(placed.id);
  }, [order]);

  if (!isOpen) return null;

  const selectedOrder = orders.find(o => o.id === selectedId) || orders[0];
  if (!selectedOrder) return null;

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
            {orders.map(ord => (
              <div
                key={ord.id}
                className={`order-item-card p-2 rounded cursor-pointer ${selectedOrder.id === ord.id ? 'active-order' : ''}`}
                onClick={() => setSelectedId(ord.id)}
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
                <div className="text-xs text-secondary font-bold"> PRODUCER PAYOUT DETAILS</div>
                <div className="text-sm font-semibold mt-1">{selectedOrder.farmerName}</div>
                <div className="text-xs text-secondary">📍 {selectedOrder.farmerLocation}</div>
                <div className="text-xs text-success font-bold mt-1">
                  💰 Direct Bank Transfer: ₹{selectedOrder.farmerPayout} (Zero Middlemen Cuts)
                </div>
              </div>

              <div>
                <div className="text-xs text-secondary font-bold">SMART COLD-CHAIN TELEMETRY</div>
                <div className="text-sm font-semibold mt-1">
                  Driver: {selectedOrder.driverName || 'Dispatch being assigned'}
                </div>
                <div className="text-xs text-secondary">
                  Vehicle: {selectedOrder.vehicleNo || '—'}
                </div>
                <div className="text-xs text-primary font-bold mt-1">
                  Temp: {selectedOrder.coldTemp || 'Ambient (monitoring starts at pickup)'}
                </div>
                <div className="text-xs text-secondary mt-1">
                  Platform fee: ₹{selectedOrder.platformFee}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
