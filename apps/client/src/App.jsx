import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/UI/Toast';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import CartDrawer from './components/Cart/CartDrawer';
import GuidedTour from './components/Tour/GuidedTour';
import OrderTracker from './components/OrderTracker/OrderTracker';

import Landing from './pages/Landing/Landing';
import FarmerPortal from './pages/FarmerPortal/FarmerPortal';
import Marketplace from './pages/Marketplace/Marketplace';
import BulkBuyer from './pages/BulkBuyer/BulkBuyer';

// Charting (Recharts) and mapping (Leaflet) are heavy and only two routes need them,
// so they are split out of the initial bundle instead of being shipped to every visitor.
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Logistics = lazy(() => import('./pages/Logistics/Logistics'));

import './styles/index.css';

function ModuleLoader() {
  return (
    <div className="container text-center" style={{ padding: '80px 20px' }}>
      <div style={{ fontSize: '2rem' }}>⏳</div>
      <p className="text-secondary" style={{ marginTop: '8px' }}>Loading module…</p>
    </div>
  );
}

/**
 * Routes live in their own component so the error boundary can read the current
 * path and re-key itself on navigation — otherwise one crashing page would keep
 * showing its error screen even after the user navigates somewhere else.
 */
function RouteContent() {
  const location = useLocation();

  return (
    <ErrorBoundary key={location.pathname}>
      <Suspense fallback={<ModuleLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route
            path="/marketplace"
            element={
              <ProtectedRoute allowedRoles={['consumer', 'bulk_buyer', 'admin']} pathName="Marketplace">
                <Marketplace />
              </ProtectedRoute>
            }
          />

          <Route
            path="/farmer"
            element={
              <ProtectedRoute allowedRoles={['farmer', 'admin']} pathName="Farmer Portal">
                <FarmerPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bulk-buyer"
            element={
              <ProtectedRoute allowedRoles={['bulk_buyer', 'admin']} pathName="Bulk Procurement">
                <BulkBuyer />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['admin']} pathName="AI Analytics Dashboard">
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/logistics"
            element={
              <ProtectedRoute allowedRoles={['admin']} pathName="Smart Logistics Hub">
                <Logistics />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default function App() {
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Opening the tracker from checkout carries the freshly placed order with it so
  // the progress screen shows what the buyer actually just paid for.
  const openTracker = (order = null) => {
    if (order) setPlacedOrder(order);
    setTrackerOpen(true);
  };

  return (
    <AppProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="full-layout flex flex-col justify-between min-h-screen">
              <Navbar onOpenTracker={() => openTracker()} />
              <main style={{ flex: 1, paddingTop: '88px' }}>
                <RouteContent />
              </main>

              <GuidedTour />
              <CartDrawer onOpenTracker={openTracker} />
              <OrderTracker isOpen={trackerOpen} onClose={() => setTrackerOpen(false)} order={placedOrder} />
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AppProvider>
  );
}
