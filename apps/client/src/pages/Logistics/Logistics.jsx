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

const STATUS_LABELS = {
  in_transit: { text: 'In transit', badge: 'badge-green' },
  loading: { text: 'Loading', badge: 'badge-amber' },
  delivered: { text: 'Delivered', badge: 'badge-blue' },
};

const sum = (values) => values.reduce((total, v) => total + (v || 0), 0);
const formatNumber = (value) => Math.round(value).toLocaleString('en-IN');

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatEta = (iso) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Derived once at module scope: the fleet summary is always consistent with the cards.
const FLEET = deliveryRoutes.map(route => ({
  ...route,
  utilizationPercent: route.capacity > 0 ? Math.round((route.currentLoad / route.capacity) * 100) : 0,
}));

const TOTAL_CAPACITY = sum(FLEET.map(r => r.capacity));
const TOTAL_LOAD = sum(FLEET.map(r => r.currentLoad));
const FLEET_UTILIZATION = TOTAL_CAPACITY > 0 ? Math.round((TOTAL_LOAD / TOTAL_CAPACITY) * 100) : 0;
const TOTAL_DISTANCE = sum(FLEET.map(r => r.distance));
const ACTIVE_ROUTES = FLEET.filter(r => r.status !== 'delivered').length;

const usageTone = (percent) => (percent >= 85 ? '#dc2626' : percent >= 60 ? '#16a34a' : '#d97706');

export default function Logistics() {
  const [selectedRoute, setSelectedRoute] = useState(FLEET[0]);
  const selectedStatus = STATUS_LABELS[selectedRoute.status] || {
    text: selectedRoute.status,
    badge: 'badge-amber',
  };

  return (
    <div className="logistics-page container">
      <header className="logistics-header">
        <span className="badge badge-amber">🚛 Cold-chain &amp; logistics</span>
        <h1 className="page-title">Route Optimisation &amp; Fleet Tracking</h1>
        <p className="page-subtitle">
          Aggregated farm produce is matched to regional demand centres, then routed to cut transit
          time and spoilage. Pick a route on the left to plot it.
        </p>
      </header>

      {/* ---------- Fleet summary ---------- */}
      <section className="logistics-section">
        <div className="grid grid-3 gap-6">
          <div className="card card-body logistics-stat">
            <span className="logistics-stat-label">Active routes</span>
            <div className="stat-value">{ACTIVE_ROUTES}</div>
            <span className="logistics-stat-unit">of {FLEET.length} scheduled routes are not yet delivered</span>
          </div>

          <div className="card card-body logistics-stat">
            <span className="logistics-stat-label">Fleet utilisation</span>
            <div className="stat-value" style={{ color: usageTone(FLEET_UTILIZATION) }}>{FLEET_UTILIZATION}%</div>
            <span className="logistics-stat-unit">
              {formatNumber(TOTAL_LOAD)} of {formatNumber(TOTAL_CAPACITY)} kg of capacity filled
            </span>
          </div>

          <div className="card card-body logistics-stat">
            <span className="logistics-stat-label">Distance scheduled</span>
            <div className="stat-value">{formatNumber(TOTAL_DISTANCE)} km</div>
            <span className="logistics-stat-unit">Combined corridor length across the active fleet</span>
          </div>
        </div>
      </section>

      {/* ---------- Route list + map ---------- */}
      <div className="grid grid-3 gap-6 logistics-layout">
        <div className="route-list flex flex-col gap-4">
          <h2 className="logistics-section-title">Active fleet routes</h2>

          {FLEET.map(route => {
            const routeStatus = STATUS_LABELS[route.status] || {
              text: route.status,
              badge: 'badge-amber',
            };
            const isSelected = selectedRoute.id === route.id;

            return (
              <button
                key={route.id}
                type="button"
                className={`card route-card ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedRoute(route)}
                aria-pressed={isSelected}
              >
                <span className="route-card-head">
                  <strong>{route.id}</strong>
                  <span className={`badge ${routeStatus.badge}`}>{routeStatus.text}</span>
                </span>

                <span className="route-path">🌾 {route.from.name} → 🏙️ {route.to.name}</span>

                <span className="route-metrics">
                  <span>📏 {route.distance} km</span>
                  <span>⏱️ {formatDuration(route.duration)}</span>
                </span>
                <span className="route-vehicle">🚚 {route.vehicleType}</span>

                <span className="route-load">
                  <span className="route-load-top">
                    <span>Load {formatNumber(route.currentLoad)} / {formatNumber(route.capacity)} kg</span>
                    <strong style={{ color: usageTone(route.utilizationPercent) }}>{route.utilizationPercent}%</strong>
                  </span>
                  <span className="route-load-bar">
                    <span
                      className="route-load-fill"
                      style={{
                        width: `${route.utilizationPercent}%`,
                        background: usageTone(route.utilizationPercent),
                      }}
                    />
                  </span>
                </span>

                <span className="route-products">
                  {route.products.map(product => (
                    <span className="route-chip" key={product}>{product}</span>
                  ))}
                </span>

                <span className="route-eta">🕒 ETA {formatEta(route.estimatedArrival)}</span>
              </button>
            );
          })}
        </div>

        {/* Map Box */}
        <div className="map-container-box card col-span-2">
          <div className="map-card-head">
            <div>
              <h2 className="logistics-section-title">Route {selectedRoute.id}</h2>
              <p className="logistics-section-sub">
                {selectedRoute.from.name} → {selectedRoute.to.name} · {selectedRoute.distance} km ·{' '}
                {selectedRoute.waypoints.length} waypoints
              </p>
            </div>
            <span className={`badge ${selectedStatus.badge}`}>{selectedStatus.text}</span>
          </div>

          <MapContainer
            key={selectedRoute.id}
            center={[selectedRoute.from.lat, selectedRoute.from.lng]}
            zoom={6}
            style={{ width: '100%', height: '440px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Farm Marker */}
            <Marker position={[selectedRoute.from.lat, selectedRoute.from.lng]} icon={greenIcon}>
              <Popup>
                <strong>🌾 Origin farm hub:</strong><br />
                {selectedRoute.from.name}
              </Popup>
            </Marker>

            {/* Buyer Marker */}
            <Marker position={[selectedRoute.to.lat, selectedRoute.to.lng]} icon={blueIcon}>
              <Popup>
                <strong>🏙️ Destination hub:</strong><br />
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

          <div className="map-legend">
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#16a34a' }} /> Origin farm hub
            </span>
            <span className="map-legend-item">
              <span className="map-legend-dot" style={{ background: '#0284c7' }} /> Destination hub
            </span>
            <span className="map-legend-item">
              <span className="map-legend-line" /> Planned corridor
            </span>
            <span className="map-legend-eta">🕒 ETA {formatEta(selectedRoute.estimatedArrival)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}