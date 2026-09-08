import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';

/**
 * Traffic chart with 24h / 30d / 1y toggle.
 * Uses Recharts and generates fake historical data from aggregate totals.
 * 
 * Props:
 *   summary: { last24h, last30d, last1y, totalRedirects }
 */
const TrafficChart = ({ summary = {}, hourlyData = [] }) => {
  const [activeRange, setActiveRange] = useState('24h');

  const ranges = [
    { key: '24h', label: '24 Hours' },
    { key: '30d', label: '30 Days' },
    { key: '1y', label: '1 Year' },
  ];

  // Generate chart data strictly from actual backend data
  const chartData = useMemo(() => {
    const now = new Date();
    const data = [];

    if (activeRange === '24h') {
      // Use real hourlyData from backend
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        
        // Format to match backend dates (local time offset to ensure correct YYYY-MM-DD match)
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const bucketDate = `${year}-${month}-${day}`;
        const bucketHour = d.getHours();
        
        // Sum redirects for this specific bucket
        const bucketRedirects = hourlyData
          .filter(item => item.date === bucketDate && item.hour === bucketHour)
          .reduce((sum, item) => sum + (item.redirects || 0), 0);

        data.push({
          date: d,
          label: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          redirects: bucketRedirects
        });
      }
    } else if (activeRange === '30d') {
      for (let i = 29; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        data.push({
          date: d,
          label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          redirects: 0 // Real daily data endpoint not implemented yet
        });
      }
    } else if (activeRange === '1y') {
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({
          date: d,
          label: d.toLocaleDateString([], { month: 'short', year: '2-digit' }),
          redirects: 0 // Real monthly data endpoint not implemented yet
        });
      }
    }

    return data;
  }, [activeRange, summary]);

  const isEmpty = chartData.every(d => d.redirects === 0);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '12px',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          color: '#fff'
        }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#94a3b8' }}>{label}</p>
          <p style={{ margin: 0, fontWeight: 700, color: '#a7e245', fontSize: '14px' }}>
            {payload[0].value.toLocaleString()} redirects
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="traffic-chart">
      <div className="traffic-chart-header">
        <h4 className="analytics-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Redirect Traffic
        </h4>
        <div className="traffic-chart-range-tabs">
          {ranges.map((r) => (
            <button
              key={r.key}
              className={`traffic-range-tab ${activeRange === r.key ? 'active' : ''}`}
              onClick={() => setActiveRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="traffic-chart-canvas-wrapper" style={{ height: '300px', width: '100%', position: 'relative' }}>
        {isEmpty ? (
          <div className="traffic-chart-empty" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.4)', zIndex: 10
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: '8px' }}>
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            <p>No redirects recorded yet</p>
          </div>
        ) : null}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRedirects" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a7e245" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a7e245" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8892b0', fontSize: 11 }}
              minTickGap={30}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#8892b0', fontSize: 11 }}
              tickFormatter={(value) => value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="redirects" 
              stroke="#a7e245" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRedirects)" 
              animationDuration={1500}
              activeDot={{ r: 6, fill: '#a7e245', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrafficChart;
