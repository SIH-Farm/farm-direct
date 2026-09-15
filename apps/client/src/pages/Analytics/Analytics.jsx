import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { demandForecast } from '../../data/mockData';
import './Analytics.css';

export default function Analytics() {
  return (
    <div className="analytics-page container">
      <div className="analytics-header">
        <span className="badge badge-blue">🤖 AI Demand Engine</span>
        <h1 className="page-title">AI Demand Forecasting & Predictive Insights</h1>
        <p className="page-subtitle">
          Predictive machine learning models for harvest planning, crop demand trends, and price stability.
        </p>
      </div>

      {/* Top AI Metrics */}
      <div className="grid grid-3 gap-6 analytics-metrics">
        <div className="card card-body">
          <span className="badge badge-green">Demand Prediction Accuracy</span>
          <div className="stat-value" style={{ marginTop: '10px' }}>94.2%</div>
          <p className="text-sm text-secondary">Based on historical Mandi sales, weather, and consumer buying trends.</p>
        </div>

        <div className="card card-body">
          <span className="badge badge-amber">Recommended Focus Crop</span>
          <div className="stat-value" style={{ marginTop: '10px', color: '#d97706' }}>Onion & Mango</div>
          <p className="text-sm text-secondary">High demand spike expected in Q2 2027. Recommend FPO pooling.</p>
        </div>

        <div className="card card-body">
          <span className="badge badge-blue">Post-Harvest Spoilage Saved</span>
          <div className="stat-value" style={{ marginTop: '10px', color: '#0284c7' }}>1,420 Tons</div>
          <p className="text-sm text-secondary">Route optimization reduced average transit delays by 14 hours.</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="card card-body analytics-chart-card" style={{ marginTop: '24px' }}>
        <div className="chart-header flex justify-between items-center">
          <div>
            <h3>📈 9-Month Demand Forecast by Crop (in Quintals)</h3>
            <p className="text-secondary text-sm">AI recommendation curve to guide farmer planting schedules</p>
          </div>
          <span className="badge badge-green">Live ML Stream</span>
        </div>

        <div style={{ width: '100%', height: 380, marginTop: '24px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={demandForecast} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTomato" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOnion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorWheat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="tomato" name="Tomato Demand" stroke="#ef4444" fillOpacity={1} fill="url(#colorTomato)" />
              <Area type="monotone" dataKey="onion" name="Onion Demand" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOnion)" />
              <Area type="monotone" dataKey="wheat" name="Wheat Demand" stroke="#22c55e" fillOpacity={1} fill="url(#colorWheat)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
