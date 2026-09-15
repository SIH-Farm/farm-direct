import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import CartDrawer from './components/Cart/CartDrawer';

import Landing from './pages/Landing/Landing';
import FarmerPortal from './pages/FarmerPortal/FarmerPortal';
import Marketplace from './pages/Marketplace/Marketplace';
import BulkBuyer from './pages/BulkBuyer/BulkBuyer';
import Analytics from './pages/Analytics/Analytics';
import Logistics from './pages/Logistics/Logistics';

import './styles/index.css';

export default function App() {
  return (
    <AppProvider>
      <CartProvider>
        <Router>
          <div className="full-layout flex flex-col justify-between min-h-screen">
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/farmer" element={<FarmerPortal />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/bulk-buyer" element={<BulkBuyer />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/logistics" element={<Logistics />} />
              </Routes>
            </main>
            <CartDrawer />
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AppProvider>
  );
}
