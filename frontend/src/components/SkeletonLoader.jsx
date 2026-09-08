import React from 'react';
import './SkeletonLoader.css';

/**
 * Reusable skeleton loading components for analytics dashboard.
 */

export const SkeletonBox = ({ width, height, borderRadius, className = '' }) => (
  <div
    className={`skeleton-box ${className}`}
    style={{ width, height, borderRadius: borderRadius || 'var(--radius-sm)' }}
  />
);

export const SkeletonStatCards = () => (
  <div className="skeleton-stat-row">
    {[0, 1, 2, 3].map((i) => (
      <div key={i} className="skeleton-stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
        <SkeletonBox width={44} height={44} borderRadius="var(--radius-md)" />
        <div className="skeleton-stat-content">
          <SkeletonBox width="60%" height={28} />
          <SkeletonBox width="80%" height={12} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonChart = () => (
  <div className="skeleton-chart-card">
    <div className="skeleton-chart-header">
      <SkeletonBox width={140} height={18} />
      <div className="skeleton-chart-tabs">
        <SkeletonBox width={70} height={28} borderRadius="var(--radius-full)" />
        <SkeletonBox width={70} height={28} borderRadius="var(--radius-full)" />
        <SkeletonBox width={70} height={28} borderRadius="var(--radius-full)" />
      </div>
    </div>
    <div className="skeleton-chart-body">
      {[40, 65, 45, 80, 55, 70, 35, 60, 75, 50, 85, 42].map((h, i) => (
        <div
          key={i}
          className="skeleton-chart-bar"
          style={{ height: `${h}%`, animationDelay: `${i * 0.05}s` }}
        />
      ))}
    </div>
  </div>
);

export const SkeletonRegions = () => (
  <div className="skeleton-region-card">
    <SkeletonBox width={140} height={18} className="skeleton-mb-lg" />
    {[0, 1, 2, 3, 4].map((i) => (
      <div key={i} className="skeleton-region-row" style={{ animationDelay: `${i * 0.08}s` }}>
        <div className="skeleton-region-left">
          <SkeletonBox width={24} height={24} borderRadius="50%" />
          <SkeletonBox width={100} height={14} />
        </div>
        <div className="skeleton-region-right">
          <SkeletonBox width={80} height={6} borderRadius={3} />
          <SkeletonBox width={40} height={14} />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonUrlList = () => (
  <div className="skeleton-url-card">
    <SkeletonBox width={120} height={18} className="skeleton-mb-lg" />
    {[0, 1, 2].map((i) => (
      <div key={i} className="skeleton-url-row" style={{ animationDelay: `${i * 0.1}s` }}>
        <div className="skeleton-url-left">
          <SkeletonBox width={70} height={16} />
          <SkeletonBox width="80%" height={12} />
        </div>
        <div className="skeleton-url-stats">
          <SkeletonBox width={50} height={20} />
          <SkeletonBox width={40} height={20} />
          <SkeletonBox width={45} height={20} />
        </div>
      </div>
    ))}
  </div>
);
