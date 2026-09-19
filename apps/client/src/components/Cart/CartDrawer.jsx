import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../data/mockData';
import { calculatePricing } from '../../utils/pricingEngine';
import CheckoutModal from '../CheckoutModal/CheckoutModal';
import './CartDrawer.css';

export default function CartDrawer({ onOpenTracker }) {
  const { items, isOpen, closeCart, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { t } = useApp();
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    setShowCheckoutModal(true);
  };

  // The basket is emptied the moment payment succeeds, but the receipt stays on
  // screen — dismissing it (or tapping "Track") is what closes the whole flow.
  const handleOrderSuccess = (order) => {
    setPlacedOrder(order);
    clearCart();
  };

  const handleDismissCheckout = () => {
    setShowCheckoutModal(false);
    if (placedOrder) closeCart();
  };

  const handleTrackOrder = (order) => {
    setShowCheckoutModal(false);
    closeCart();
    if (onOpenTracker) onOpenTracker(order || placedOrder);
  };

  const totalSavings = items.reduce((sum, item) => {
    const { retailPrice } = calculatePricing(item.product.farmPrice, item.product.cropName);
    const savings = (retailPrice - item.pricePerUnit) * item.quantity;
    return sum + (savings > 0 ? savings : 0);
  }, 0);

  return (
    <>
      <div className="cart-backdrop" onClick={closeCart}>
        <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="cart-header">
            <h2>🛒 {t('ui.cart.title')} ({items.reduce((s, i) => s + i.quantity, 0)})</h2>
            <button className="cart-close-btn" onClick={closeCart}>✕</button>
          </div>

          {items.length === 0 ? (
            <div className="cart-empty">
              <span className="cart-empty-icon">🌾</span>
              <h3>{t('ui.cart.empty')}</h3>
              <p>{t('ui.cart.emptyHint')}</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => {
                  const p = item.product;
                  const { retailPrice, consumerSaving } = calculatePricing(p.farmPrice, p.cropName);
                  const atStockLimit = item.maxQuantity > 0 && item.quantity >= item.maxQuantity;
                  return (
                    <div key={item.productId} className="cart-item">
                      <div className="cart-item-details">
                        <h4>{p.cropName} <span className="cart-item-grade">Grade {p.grade || 'A'}</span></h4>
                        <p className="cart-item-farmer">Farmer: {p.farmerName || p.farmerId}</p>
                        <div className="cart-item-price-row">
                          <span className="cart-item-price">₹{item.pricePerUnit}/kg</span>
                          <span className="cart-item-retail">Retail: ₹{retailPrice}/kg</span>
                          {consumerSaving > 0 && (
                            <span className="text-xs text-success font-bold">Save ₹{consumerSaving}/kg</span>
                          )}
                        </div>
                        {atStockLimit && (
                          <p className="text-xs" style={{ color: '#d97706', marginTop: '4px' }}>
                            Max available: {item.maxQuantity} kg
                          </p>
                        )}
                      </div>

                      <div className="cart-item-controls">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                        <span>{item.quantity} kg</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={atStockLimit}
                          title={atStockLimit ? `Only ${item.maxQuantity}kg available` : 'Add 1kg'}
                        >+</button>
                        <button className="cart-remove-btn" onClick={() => removeFromCart(item.productId)}>🗑️</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-summary">
                {/* Hyperlocal Batch Logistics Note */}
                <div style={{ background: '#f0f9ff', padding: '10px', borderRadius: '8px', border: '1px solid #7dd3fc', marginBottom: '12px', fontSize: '0.75rem', color: '#0369a1' }}>
                  <strong>🚚 Neighborhood Micro-Hub Logistics:</strong> Small retail orders (1-4 kg) are aggregated at your gated society/locality drop-point for zero-cost morning delivery!
                </div>

                {totalSavings > 0 && (
                  <div className="cart-total-savings">
                    🎉 {t('ui.cart.savings')}: <strong>{formatCurrency(totalSavings)}</strong>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>{t('ui.cart.subtotal')}</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>{t('ui.cart.delivery')}</span>
                  <span className="text-success">{t('ui.cart.free')}</span>
                </div>
                <div className="cart-summary-row total">
                  <span>{t('ui.cart.total')}</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>

                <button className="btn btn-primary btn-lg w-full" onClick={handleCheckoutClick} id="checkout-btn">
                  {t('ui.cart.checkout')} ({formatCurrency(totalAmount)})
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showCheckoutModal && (
        <CheckoutModal
          isOpen={showCheckoutModal}
          onClose={handleDismissCheckout}
          onTrack={handleTrackOrder}
          cartItems={items.map(i => ({ ...i.product, quantity: i.quantity, pricePerUnit: i.pricePerUnit }))}
          totalAmount={totalAmount}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
    </>
  );
}
