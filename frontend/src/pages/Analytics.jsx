import React from 'react';
import { useParams } from 'react-router-dom';
import { BarChart3, TrendingUp, Globe, Monitor, Users, Clock } from 'lucide-react';
import './Analytics.css';

const placeholderCards = [
  { icon: <TrendingUp size={24} />, label: 'Total Clicks', value: '—' },
  { icon: <Users size={24} />, label: 'Unique Visitors', value: '—' },
  { icon: <Globe size={24} />, label: 'Countries', value: '—' },
  { icon: <Monitor size={24} />, label: 'Devices', value: '—' },
  { icon: <Clock size={24} />, label: 'Avg. Daily Clicks', value: '—' },
];

const Analytics = () => {
  const { id } = useParams();

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <BarChart3 size={28} />
        <div>
          <h2 className="analytics-title">
            {id ? `Analytics for URL #${id}` : 'Analytics Dashboard'}
          </h2>
          <p className="analytics-sub">Track performance and engagement metrics.</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="analytics-stats-grid">
        {placeholderCards.map((card, i) => (
          <div key={i} className="analytics-stat-card glass-card">
            <div className="analytics-stat-icon">{card.icon}</div>
            <div>
              <span className="analytics-stat-value">{card.value}</span>
              <span className="analytics-stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Chart placeholder */}
      <div className="analytics-chart-section glass-card">
        <h3 className="analytics-chart-title">Clicks Over Time</h3>
        <div className="analytics-chart-placeholder">
          <div className="analytics-coming-soon">
            <BarChart3 size={48} />
            <h4>Analytics Coming Soon</h4>
            <p>We're building powerful analytics to help you track every click, visitor, and trend. Stay tuned!</p>
          </div>
        </div>
      </div>

      {/* Additional sections */}
      <div className="analytics-grid-2">
        <div className="analytics-section glass-card">
          <h3 className="analytics-chart-title">Top URLs</h3>
          <div className="analytics-empty-section">
            <p>No data yet</p>
          </div>
        </div>
        <div className="analytics-section glass-card">
          <h3 className="analytics-chart-title">Device / Browser</h3>
          <div className="analytics-empty-section">
            <p>No data yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
