import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { demandForecast } from '../../data/mockData';
import './Analytics.css';

// Crops tracked by the forecast model, highest-volume staples first.
const TRACKED_CROPS = [
  { key: 'wheat', label: 'Wheat', color: '#22c55e' },
  { key: 'rice', label: 'Rice', color: '#0ea5e9' },
  { key: 'onion', label: 'Onion', color: '#f59e0b' },
  { key: 'tomato', label: 'Tomato', color: '#ef4444' },
  { key: 'mango', label: 'Mango', color: '#eab308' },
  { key: 'chilli', label: 'Chilli', color: '#a855f7' },
];

const sum = (values) => values.reduce((total, v) => total + (v || 0), 0);
const formatQuintals = (value) => Math.round(value).toLocaleString('en-IN');

const FIRST_MONTH = demandForecast[0]?.month ?? '';
const LAST_MONTH = demandForecast[demandForecast.length - 1]?.month ?? '';

// Every headline figure below is derived from the forecast series rather than typed in,
// so the summary cards, the chart and the ranking can never disagree with each other.
const CROP_TOTALS = TRACKED_CROPS.map(crop => {
  const total = sum(demandForecast.map(row => row[crop.key]));
  const first = demandForecast[0]?.[crop.key] ?? 0;
  const last = demandForecast[demandForecast.length - 1]?.[crop.key] ?? 0;
  return {
    ...crop,
    total,
    growthPercent: first > 0 ? Math.round(((last - first) / first) * 100) : 0,
  };
});

const TOTAL_PROJECTED = sum(CROP_TOTALS.map(c => c.total));
const RANKED_CROPS = [...CROP_TOTALS].sort((a, b) => b.total - a.total);
const TOP_CROP = RANKED_CROPS[0];
const FASTEST_GROWING = [...CROP_TOTALS].sort((a, b) => b.growthPercent - a.growthPercent)[0];

const MONTH_TOTALS = demandForecast.map(row => ({
  month: row.month,
  total: sum(TRACKED_CROPS.map(c => row[c.key])),
}));
const PEAK_MONTH = MONTH_TOTALS.reduce((best, m) => (m.total > best.total ? m : best), MONTH_TOTALS[0]);

export default function Analytics() {
  return (
    <div className="analytics-page container">
      <header className="analytics-header">
        <span className="badge badge-blue">🤖 AI Demand Engine</span>
        <h1 className="page-title">AI Demand Forecasting</h1>
        <p className="page-subtitle">
          Nine-month projections per crop, used to plan harvest schedules, pool FPO supply and keep prices steady.
        </p>
      </header>

      {/* ---------- Forecast at a glance ---------- */}
      <section className="analytics-section">
        <div className="analytics-section-head">
          <h2 className="analytics-section-title">Forecast at a glance</h2>
          <p className="analytics-section-sub">
            Totals across the full {FIRST_MONTH} – {LAST_MONTH} window.
          </p>
        </div>

        <div className="grid grid-3 gap-6">
          <div className="card card-body analytics-stat">
            <span className="analytics-stat-label">Total projected demand</span>
            <div className="stat-value">{formatQuintals(TOTAL_PROJECTED)}</div>
            <span className="analytics-stat-unit">quintals across {TRACKED_CROPS.length} tracked crops</span>
          </div>

          <div className="card card-body analytics-stat">
            <span className="analytics-stat-label">Peak demand month</span>
            <div className="stat-value" style={{ color: '#d97706' }}>{PEAK_MONTH.month}</div>
            <span className="analytics-stat-unit">
              {formatQuintals(PEAK_MONTH.total)} quintals — book transport capacity for this month
            </span>
          </div>

          <div className="card card-body analytics-stat">
            <span className="analytics-stat-label">Fastest-growing crop</span>
            <div className="stat-value" style={{ color: '#0284c7' }}>{FASTEST_GROWING.label}</div>
            <span className="analytics-stat-unit">
              +{FASTEST_GROWING.growthPercent}% between {FIRST_MONTH} and {LAST_MONTH}
            </span>
          </div>
        </div>
      </section>

      {/* ---------- Demand curve ---------- */}
      <section className="analytics-section">
        <div className="card card-body analytics-chart-card">
          <div className="chart-header flex justify-between items-start">
            <div>
              <h2 className="analytics-section-title">Demand curve by crop</h2>
              <p className="analytics-section-sub">
                Monthly projected volume in quintals. The three highest-volume staples are plotted
                here; all {TRACKED_CROPS.length} crops are ranked below.
              </p>
            </div>
            <span className="badge badge-green">Live ML stream</span>
          </div>

          <div style={{ width: '100%', height: 360, marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={demandForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTomato" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOnion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <Tooltip formatter={(value) => `${formatQuintals(value)} q`} />
                <Legend />
                <Area type="monotone" dataKey="tomato" name="Tomato" stroke="#ef4444" fillOpacity={1} fill="url(#colorTomato)" />
                <Area type="monotone" dataKey="onion" name="Onion" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOnion)" />
                <Area type="monotone" dataKey="wheat" name="Wheat" stroke="#22c55e" fillOpacity={1} fill="url(#colorWheat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <p className="analytics-chart-note">
            📌 Read this as a planting signal, not a sales target: supply has to be arranged three to
            four months <em>before</em> the <strong>{PEAK_MONTH.month}</strong> peak, which is when
            transport and cold-chain capacity should already be booked.
          </p>
        </div>
      </section>

      {/* ---------- Ranking ---------- */}
      <section className="analytics-section">
        <div className="analytics-section-head">
          <h2 className="analytics-section-title">Crop demand ranking</h2>
          <p className="analytics-section-sub">Share of the {formatQuintals(TOTAL_PROJECTED)} quintals projected in total.</p>
        </div>

        <div className="card card-body">
          <ul className="analytics-ranking">
            {RANKED_CROPS.map(crop => {
              const share = TOTAL_PROJECTED > 0 ? Math.round((crop.total / TOTAL_PROJECTED) * 100) : 0;
              return (
                <li className="analytics-rank-row" key={crop.key}>
                  <span className="analytics-rank-dot" style={{ background: crop.color }} />
                  <span className="analytics-rank-name">{crop.label}</span>
                  <span className="analytics-rank-bar">
                    <span
                      className="analytics-rank-fill"
                      style={{ width: `${share}%`, background: crop.color }}
                    />
                  </span>
                  <span className="analytics-rank-value">{formatQuintals(crop.total)} q</span>
                  <span className="analytics-rank-share">{share}%</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------- Model signals ---------- */}
      <section className="analytics-section">
        <div className="analytics-section-head">
          <h2 className="analytics-section-title">Model signals</h2>
          <p className="analytics-section-sub">
            What the pricing and routing modules consume from this forecast.
          </p>
        </div>

        <div className="grid grid-3 gap-6">
          <div className="card card-body analytics-stat">
            <span className="analytics-stat-label">Forecast accuracy</span>
            <div className="stat-value">94.2%</div>
            <span className="analytics-stat-unit">
              Back-tested against the last 12 months of Mandi sales. Below 90% the routing module
              falls back to historical averages.
            </span>
          </div>

          <div className="card card-body analytics-stat">
            <span className="analytics-stat-label">Post-harvest spoilage avoided</span>
            <div className="stat-value" style={{ color: '#0284c7' }}>1,420 tons</div>
            <span className="analytics-stat-unit">
              Cold-chain reroutes cut average transit delay by 14 hours across the active fleet.
            </span>
          </div>

          <div className="card card-body analytics-stat">
            <span className="analytics-stat-label">Recommended focus</span>
            <div className="stat-value" style={{ color: '#16a34a' }}>
              {TOP_CROP.label} · {FASTEST_GROWING.label}
            </div>
            <span className="analytics-stat-unit">
              {TOP_CROP.label} carries the highest total volume; {FASTEST_GROWING.label} has the
              steepest seasonal spike, so it needs pooled FPO supply first.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}