import React, { useState, useEffect, useContext } from 'react';
import {
  BarChart3, TrendingUp, Clock, Globe, RefreshCw,
  Activity, Loader2, ArrowLeft, ExternalLink,
  ChevronRight
} from 'lucide-react';
import { getAnalyticsDashboard, syncAnalytics } from '../api/analyticsApi';
import { getCountryInfo } from '../utils/countryData';
import { truncateUrl, getPublicShortUrl } from '../utils/url';
import { ToastContext } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import WorldMapChart from './WorldMapChart';
import TrafficChart from './TrafficChart';
import { SkeletonStatCards, SkeletonChart, SkeletonRegions, SkeletonUrlList } from './SkeletonLoader';
import './AnalyticsSection.css';

const AnalyticsSection = ({ refreshTrigger }) => {
  const { success, error: showError } = useContext(ToastContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null); // For URL detail view
  const [animateCards, setAnimateCards] = useState(false);

  // Live "time ago" for lastSyncedAt
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [refreshTrigger]); // Run on mount and when refreshTrigger changes

  const fetchAnalytics = async () => {
    setLoading(true);
    setFetchError(false);
    try {
      const res = await getAnalyticsDashboard();
      setData(res.data);
      // Trigger card number animation after data loads
      setAnimateCards(false);
      requestAnimationFrame(() => setAnimateCards(true));
    } catch (err) {
      setFetchError(true);
      showError(getErrorMessage(err) || 'Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      // Fake 5-second loading state for UI flair as requested
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      await syncAnalytics();
      success('Analytics synced successfully!');
      await fetchAnalytics();
    } catch (err) {
      showError(getErrorMessage(err) || 'Unable to sync analytics. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  const formatNumber = (num) => {
    if (num == null) return '0';
    return num.toLocaleString();
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Not synced yet';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  // ===== SKELETON LOADING STATE =====
  if (loading) {
    return (
      <div className="analytics-section" id="analytics-section">
        <div className="analytics-section-header">
          <h3 className="dash-section-title">
            <BarChart3 size={20} /> Analytics
          </h3>
        </div>
        <SkeletonStatCards />
        <SkeletonChart />
        <div className="analytics-globe-region-row">
          <SkeletonRegions />
          <SkeletonRegions />
        </div>
        <SkeletonUrlList />
      </div>
    );
  }

  // ===== ERROR STATE =====
  if (fetchError || !data) {
    return (
      <div className="analytics-section" id="analytics-section">
        <div className="analytics-section-header">
          <h3 className="dash-section-title">
            <BarChart3 size={20} /> Analytics
          </h3>
        </div>
        <div className="analytics-error-state">
          <div className="analytics-error-icon">
            <Activity size={48} />
          </div>
          <h3>Unable to load analytics</h3>
          <p>We couldn't fetch your analytics data. This might be a temporary issue.</p>
          <button className="analytics-retry-btn" onClick={fetchAnalytics}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const { summary = {}, regions = [], urls = [], hourlyData = [], lastSyncedAt } = data;

  // ===== URL DETAIL VIEW =====
  if (selectedUrl) {
    const ua = selectedUrl;
    const topCountry = ua.topRegion ? getCountryInfo(ua.topRegion) : null;
    const publicUrl = getPublicShortUrl(ua.shortCode);

    return (
      <div className="analytics-section" id="analytics-section">
        <button className="analytics-back-btn" onClick={() => setSelectedUrl(null)}>
          <ArrowLeft size={16} /> Back to Analytics
        </button>

        <div className="analytics-detail-header">
          <div className="analytics-detail-info">
            <span className="analytics-detail-code">{ua.shortCode}</span>
            <a
              href={publicUrl}
              className="analytics-detail-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {publicUrl} <ExternalLink size={12} />
            </a>
            <span className="analytics-detail-original">{ua.originalUrl}</span>
            <span className={`analytics-detail-status ${ua.active !== false ? 'active' : 'inactive'}`}>
              {ua.active !== false ? '● Active' : '● Disabled'}
            </span>
          </div>
        </div>

        {/* Detail stat cards */}
        <div className="analytics-summary-row">
          <StatCard
            icon={<TrendingUp size={20} />}
            value={formatNumber(ua.totalRedirects)}
            label="Total Redirects"
            animate={true}
          />
          <StatCard
            icon={<Activity size={20} />}
            value={formatNumber(ua.redirectsLast24Hours)}
            label="Last 24 Hours"
            colorClass="blue"
            animate={true}
          />
          <StatCard
            icon={<BarChart3 size={20} />}
            value={formatNumber(ua.redirectsLast30Days)}
            label="Last 30 Days"
            colorClass="purple"
            animate={true}
          />
          <StatCard
            icon={<Globe size={20} />}
            value={formatNumber(ua.redirectsLast1Year)}
            label="Last 1 Year"
            colorClass="amber"
            animate={true}
          />
        </div>

        {/* Traffic chart for this URL */}
        <TrafficChart
          summary={{ 
            last24h: ua.redirectsLast24Hours, 
            last30d: ua.redirectsLast30Days, 
            last1y: ua.redirectsLast1Year,
            totalRedirects: ua.totalRedirects
          }}
          hourlyData={hourlyData.filter(h => h.urlId === ua.urlId)}
        />

        {/* Top location */}
        {topCountry && (
          <div className="analytics-detail-top-location">
            <span className="analytics-detail-top-label">Top Location</span>
            <span className="analytics-detail-top-value">
              {topCountry.flag} {topCountry.name}
            </span>
          </div>
        )}
      </div>
    );
  }

  // ===== MAIN ANALYTICS DASHBOARD =====
  return (
    <div className="analytics-section" id="analytics-section">
      {/* Header + Sync */}
      <div className="analytics-section-header">
        <h3 className="dash-section-title">
          <BarChart3 size={20} /> Analytics
        </h3>
        <div className="analytics-sync-bar">
          <span className="analytics-sync-time">
            <Clock size={12} />
            Last synced: {getTimeAgo(lastSyncedAt)}
          </span>
          <button
            className="analytics-sync-btn"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <><Loader2 size={14} className="analytics-spin" /> Syncing...</>
            ) : (
              <><RefreshCw size={14} /> Sync Now</>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary-row">
        <StatCard
          icon={<TrendingUp size={20} />}
          value={formatNumber(summary.totalRedirects)}
          label="Total Redirects"
          animate={animateCards}
        />
        <StatCard
          icon={<Activity size={20} />}
          value={formatNumber(summary.redirectsLast24Hours)}
          label="Last 24 Hours"
          colorClass="blue"
          animate={animateCards}
          delay={1}
        />
        <StatCard
          icon={<BarChart3 size={20} />}
          value={formatNumber(summary.redirectsLast30Days)}
          label="Last 30 Days"
          colorClass="purple"
          animate={animateCards}
          delay={2}
        />
        <StatCard
          icon={<Globe size={20} />}
          value={formatNumber(summary.redirectsLast1Year)}
          label="Last 1 Year"
          colorClass="amber"
          animate={animateCards}
          delay={3}
        />
      </div>

      {/* Traffic Chart */}
      <TrafficChart 
        summary={{
          last24h: summary.redirectsLast24Hours,
          last30d: summary.redirectsLast30Days,
          last1y: summary.redirectsLast1Year,
          totalRedirects: summary.totalRedirects
        }} 
        hourlyData={hourlyData} 
      />

      {/* World Map + Regions */}
      <div className="analytics-globe-region-row">
        <div className="analytics-globe-card analytics-map-card">
          <h4 className="analytics-card-title">
            <Globe size={16} /> Global Traffic
          </h4>
          <WorldMapChart regions={regions} />
        </div>

        <div className="analytics-region-card">
          <h4 className="analytics-card-title">
            <TrendingUp size={16} /> Top Locations
          </h4>
          {regions.length === 0 ? (
            <div className="analytics-empty-mini">
              <p>No location data yet</p>
            </div>
          ) : (
            <div className="analytics-region-list">
              {regions
                .sort((a, b) => (b.redirects || 0) - (a.redirects || 0))
                .slice(0, 10)
                .map((rg) => {
                  const country = getCountryInfo(rg.code);
                  const pct = rg.percentage ? rg.percentage.toFixed(1) : '0.0';
                  return (
                    <div key={rg.code || rg.region} className="analytics-region-row">
                      <div className="analytics-region-info">
                        <span className="analytics-region-flag">{country.flag}</span>
                        <span className="analytics-region-name">{country.name}</span>
                      </div>
                      <div className="analytics-region-stats">
                        <div className="analytics-region-bar-track">
                          <div
                            className="analytics-region-bar-fill"
                            style={{ width: `${Math.max(2, parseFloat(pct))}%` }}
                          />
                        </div>
                        <span className="analytics-region-count">
                          {rg.redirects?.toLocaleString()}
                        </span>
                        <span className="analytics-region-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Per-URL Analytics */}
      <div className="analytics-urls-section">
        <h4 className="analytics-card-title">
          <BarChart3 size={16} /> Your Links
        </h4>
        {(!urls || urls.length === 0) ? (
          <div className="analytics-empty-mini">
            <p>No URL analytics available yet</p>
          </div>
        ) : (
          <div className="analytics-url-list">
            {urls.map((ua) => {
              const topCountry = ua.topRegion ? getCountryInfo(ua.topRegion) : null;
              return (
                <div
                  key={ua.urlId || ua.shortCode}
                  className="analytics-url-item"
                  onClick={() => setSelectedUrl(ua)}
                >
                  <div className="analytics-url-item-left">
                    <div className="analytics-url-item-header">
                      <span className="analytics-url-item-code">{getPublicShortUrl(ua.shortCode)}</span>
                      <span className={`analytics-url-item-status ${ua.active !== false ? '' : 'disabled'}`}>
                        {ua.active !== false ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                    <span className="analytics-url-item-original">
                      {truncateUrl(ua.originalUrl || '', 50)}
                    </span>
                  </div>
                  <div className="analytics-url-item-stats">
                    <div className="analytics-url-item-stat">
                      <span className="analytics-url-item-stat-val">{(ua.totalRedirects || 0).toLocaleString()}</span>
                      <span className="analytics-url-item-stat-label">Total</span>
                    </div>
                    <div className="analytics-url-item-stat">
                      <span className="analytics-url-item-stat-val">{(ua.redirectsLast24Hours || 0).toLocaleString()}</span>
                      <span className="analytics-url-item-stat-label">24h</span>
                    </div>
                    <div className="analytics-url-item-stat">
                      <span className="analytics-url-item-stat-val">{(ua.redirectsLast30Days || 0).toLocaleString()}</span>
                      <span className="analytics-url-item-stat-label">30d</span>
                    </div>
                    {topCountry && (
                      <div className="analytics-url-item-stat">
                        <span className="analytics-url-item-stat-val">{topCountry.flag}</span>
                        <span className="analytics-url-item-stat-label">{topCountry.name}</span>
                      </div>
                    )}
                  </div>
                  <ChevronRight size={16} className="analytics-url-item-arrow" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/** Reusable stat card with subtle number pop animation */
const StatCard = ({ icon, value, label, colorClass = '', animate = false, delay = 0 }) => (
  <div
    className={`analytics-stat-card ${animate ? 'analytics-stat-animate' : ''}`}
    style={{ animationDelay: `${delay * 0.08}s` }}
  >
    <div className={`analytics-stat-icon ${colorClass ? `analytics-stat-icon-${colorClass}` : ''}`}>
      {icon}
    </div>
    <div className="analytics-stat-content">
      <span className={`analytics-stat-value ${animate ? 'analytics-value-pop' : ''}`}>{value}</span>
      <span className="analytics-stat-label">{label}</span>
    </div>
  </div>
);

export default AnalyticsSection;
