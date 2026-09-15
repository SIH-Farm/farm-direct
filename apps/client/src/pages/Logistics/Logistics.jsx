import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { deliveryRoutes } from '../../data/mockData';
import './Logistics.css';

// Custom Map Marker Icons
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function Logistics() {
  const [selectedRoute, setSelectedRoute] = useState(deliveryRoutes[0]);

  return (
    <div className="logistics-page container">
      <div className="logistics-header flex justify-between items-center">
        <div>
          <span className="badge badge-amber">🚛 Cold-Chain & Logistics</span>
          <h1 className="page-title">AI Route Optimization & Delivery Tracking</h1>
          <p className="page-subtitle">
            Smart routing algorithms matching aggregated farm produce with regional demand centers to minimize transit time.
          </p>
        </div>
      </div>

      <div className="grid grid-3 gap-6 logistics-layout" style={{ marginTop: '24px' }}>
        {/* Route Selector List */}
        <div className="route-list flex flex-col gap-4">
          <h3>Active Fleet Routes</h3>
          {deliveryRoutes.map(route => (
            <div
              key={route.id}
              className={`card route-card ${selectedRoute.id === route.id ? 'active' : ''}`}
              onClick={() => setSelectedRoute(route)}
            >
              <div className="flex justify-between items-center">
                <strong>{route.id}</strong>
                <span className="badge badge-green">{route.status}</span>
              </div>
              <div className="route-path">
                🌾 {route.from.name} → 🏙️ {route.to.name}
              </div>
              <div className="route-info text-xs text-secondary">
                🚚 {route.vehicleType} • 📏 {route.distance} km • ⏱️ {Math.round(route.duration / 60)} hrs
              </div>
            </div>
          ))}
        </div>

        {/* Map Box */}
        <div className="map-container-box card col-span-2">
          <MapContainer
            center={[selectedRoute.from.lat, selectedRoute.from.lng]}
            zoom={6}
            style={{ width: '100%', height: '480px', borderRadius: '16px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Farm Marker */}
            <Marker position={[selectedRoute.from.lat, selectedRoute.from.lng]} icon={greenIcon}>
              <Popup>
                <strong>🌾 Origin Farm Hub:</strong><br />
                {selectedRoute.from.name}
              </Popup>
            </Marker>

            {/* Buyer Marker */}
            <Marker position={[selectedRoute.to.lat, selectedRoute.to.lng]} icon={blueIcon}>
              <Popup>
                <strong>🏙️ Destination Hub:</strong><br />
                {selectedRoute.to.name}
              </Popup>
            </Marker>

            {/* Route Line */}
            <Polyline
              positions={[
                [selectedRoute.from.lat, selectedRoute.from.lng],
                ...selectedRoute.waypoints.map(w => [w.lat, w.lng]),
                [selectedRoute.to.lat, selectedRoute.to.lng]
              ]}
              color="#22c55e"
              weight={4}
              dashArray="8, 8"
            />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
