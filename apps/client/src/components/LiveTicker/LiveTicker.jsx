import React, { useEffect, useState } from 'react';
import './LiveTicker.css';

const DEFAULT_FEED = [
  "🔔 Rajesh Patil just listed 500kg Cherry Tomatoes (Nashik)",
  "🛒 Order #ORD082 placed: 200kg Sharbati Wheat from Amritsar",
  "📈 Onion Mandi Benchmark updated to ₹22/kg — FarmDirect payout ₹18/kg (+35% vs agent)",
  "🌱 Sahyadri FPO listed 2,000kg Nashik Red Onions",
  "🚚 Logistics Dispatch: Route #RT-402 in transit from Sinnar to Pune Hub",
  "✨ Lakshmi Devi added 200kg Organic Arabica Coffee (Coorg)",
];

export default function LiveTicker() {
  const [feed, setFeed] = useState(DEFAULT_FEED);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Poll notifications from server
    const fetchNotifications = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/notifications');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          const serverItems = json.data.map(n => `🔔 ${n.message}`);
          setFeed(prev => Array.from(new Set([...serverItems, ...prev])));
        }
      } catch (err) {
        // Fallback to default ticker if server offline
      }
    };

    fetchNotifications();
    const pollInterval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(pollInterval);
  }, []);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      setIndex(prev => (prev + 1) % feed.length);
    }, 4000);
    return () => clearInterval(cycleInterval);
  }, [feed.length]);

  return (
    <div className="live-ticker-container">
      <div className="ticker-label">
        <span className="live-dot"></span> LIVE MARKET ACTIVITY
      </div>
      <div className="ticker-content-wrapper">
        <div className="ticker-item fade-in-text" key={index}>
          {feed[index]}
        </div>
      </div>
    </div>
  );
}
