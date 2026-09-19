import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './components/UI/Toast';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import CartDrawer from './components/Cart/CartDrawer';
import GuidedTour from './components/Tour/GuidedTour';
import OrderTracker from './components/OrderTracker/OrderTracker';

import Landing from './pages/Landing/Landing';
import FarmerPortal from './pages/FarmerPortal/FarmerPortal';
import Marketplace from './pages/Marketplace/Marketplace';
import BulkBuyer from './pages/BulkBuyer/BulkBuyer';
import Analytics from './pages/Analytics/Analytics';
import Logistics from './pages/Logistics/Logistics';

import './styles/index.css';

export default function App() {
  const [trackerOpen, setTrackerOpen] = useState(false);

  return (
    <AppProvider>
      <ToastProvider>
        <CartProvider>
          <Router>
            <div className="full-layout flex flex-col justify-between min-h-screen">
              <Navbar onOpenTracker={() => setTrackerOpen(true)} />
              <main style={{ flex: 1, paddingTop: '88px' }}>
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
              </main>

              <GuidedTour />
              <CartDrawer onOpenTracker={() => setTrackerOpen(true)} />
              <OrderTracker isOpen={trackerOpen} onClose={() => setTrackerOpen(false)} />
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </ToastProvider>
    </AppProvider>
  );
}
