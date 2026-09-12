import React, { useState, useContext } from 'react';
import { Copy, Share2, QrCode, Edit3, Trash2, BarChart3, ExternalLink, Check, Clock, Power, PowerOff, Loader2 } from 'lucide-react';
import { getPublicShortUrl, truncateUrl, getExpirationStatus, formatExpirationDate } from '../utils/url';
import { ToastContext } from '../context/ToastContext';
import QRModal from './QRModal';
import './UrlCard.css';

import { toggleUrlStatus } from '../api/urlApi';

const UrlCard = ({ url, onEdit, onDelete, onStatusChange, onAnalyticsClick }) => {
  const { success, error } = useContext(ToastContext);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loadingToggle, setLoadingToggle] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  // The backend determines if it's active. Default to true if undefined.
  const isActive = url.active !== false;
  const publicUrl = getPublicShortUrl(url.shortCode);
  const expStatus = getExpirationStatus(url.expiresAt);
  
  const handleToggleDisable = async () => {
    if (loadingToggle) return;

    // Rate limiting logic
    const storageKey = `toggle_limit_${url.id}`;
    const limitDataStr = localStorage.getItem(storageKey);
    let limitData = limitDataStr ? JSON.parse(limitDataStr) : { count: 0, timestamp: Date.now() };
    
    const tenMinutes = 10 * 60 * 1000;
    
    if (Date.now() - limitData.timestamp > tenMinutes) {
      limitData = { count: 1, timestamp: Date.now() };
    } else {
      if (limitData.count >= 2) {
        error('You have reached the toggle limit for this URL. Please try again after 10 minutes.');
        return;
      }
      limitData.count += 1;
    }
    
    localStorage.setItem(storageKey, JSON.stringify(limitData));

    setLoadingToggle(true);
    try {
      const newState = !isActive;
      const res = await toggleUrlStatus(url.id, newState);
      
      // Artificial delay for smooth UX
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      if (onStatusChange) {
        onStatusChange({ ...url, ...res.data, active: newState });
      }
      
      success(newState ? 'Link enabled successfully' : 'Link disabled successfully');
    } catch (err) {
      // global interceptor handles toast
    } finally {
      setLoadingToggle(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      success('URL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      success('Could not copy - please copy manually.');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shortify Link',
          text: 'Check out this link!',
          url: publicUrl,
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      handleCopy();
      success('Sharing not supported on this browser. Link copied to clipboard!');
    }
  };

  // 2-second delay wrappers for actions (except copy & share)
  const handleEdit = async () => {
    if (loadingEdit) return;
    setLoadingEdit(true);
    await new Promise(r => setTimeout(r, 800));
    setLoadingEdit(false);
    onEdit(url);
  };

  const handleDelete = async () => {
    if (loadingDelete) return;
    setLoadingDelete(true);
    await new Promise(r => setTimeout(r, 800));
    setLoadingDelete(false);
    onDelete(url);
  };

  const handleAnalytics = async () => {
    if (loadingAnalytics) return;
    setLoadingAnalytics(true);
    await new Promise(r => setTimeout(r, 800));
    setLoadingAnalytics(false);
    if (onAnalyticsClick) onAnalyticsClick();
  };

  return (
    <>
      <div className={`url-card ${expStatus.isExpired ? 'url-card-expired' : ''}`}>
        <div className="url-card-header">
          <div className="url-card-short">
            <a href={publicUrl} className="url-card-short-link">
              {publicUrl.replace(/^https?:\/\//, '')}
              <ExternalLink size={14} />
            </a>
          </div>
          <div className={`url-card-badge ${expStatus.isExpired ? 'badge-expired' : 'badge-active'}`}>
            <Clock size={12} />
            {expStatus.isExpired ? 'Expired' : `Expires on ${formatExpirationDate(url.expiresAt)}`}
          </div>
        </div>

        <div className="url-card-original">
          <span className="url-card-label">Original URL</span>
          <a href={url.originalUrl} target="_blank" rel="noopener noreferrer" className="url-card-original-link" title={url.originalUrl}>
            {truncateUrl(url.originalUrl, 60)}
          </a>
        </div>

        <div className="url-card-actions">
          {/* Copy & Share — no delay as per user request */}
          <button className="url-action-btn" onClick={handleCopy} title={copied ? 'Copied!' : 'Copy short URL'}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button className="url-action-btn" onClick={handleShare} title="Share">
            <Share2 size={16} />
            <span>Share</span>
          </button>

          {/* QR — no delay, it's a modal open */}
          <button className="url-action-btn" onClick={() => setShowQR(true)} title="QR Code">
            <QrCode size={16} />
            <span>QR</span>
          </button>

          {/* Edit — 0.8s smooth delay */}
          <button className="url-action-btn" onClick={handleEdit} title="Edit URL" disabled={loadingEdit}>
            {loadingEdit ? <Loader2 size={16} className="url-toggle-spinner" /> : <Edit3 size={16} />}
            <span>{loadingEdit ? '...' : 'Edit'}</span>
          </button>

          {/* Delete — 0.8s smooth delay */}
          <button className="url-action-btn url-action-danger" onClick={handleDelete} title="Delete URL" disabled={loadingDelete}>
            {loadingDelete ? <Loader2 size={16} className="url-toggle-spinner" /> : <Trash2 size={16} />}
            <span>{loadingDelete ? '...' : 'Delete'}</span>
          </button>

          {/* Analytics — 0.8s smooth delay */}
          <button className="url-action-btn url-action-analytics" title="Analytics" onClick={handleAnalytics} disabled={loadingAnalytics}>
            {loadingAnalytics ? <Loader2 size={16} className="url-toggle-spinner" /> : <BarChart3 size={16} />}
            <span>{loadingAnalytics ? '...' : 'Analytics'}</span>
          </button>

          <div className="url-action-toggle-wrapper">
            <span className="url-toggle-label">
              {loadingToggle ? (
                <>
                  <Loader2 size={12} className="url-toggle-spinner" /> Syncing...
                </>
              ) : (
                isActive ? 'Active' : 'Disabled'
              )}
            </span>
            <label className="url-toggle-switch">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={handleToggleDisable}
                disabled={loadingToggle}
              />
              <span className={`url-toggle-slider ${loadingToggle ? 'loading' : ''}`}></span>
            </label>
          </div>
        </div>
      </div>

      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} shortCode={url.shortCode} />
    </>
  );
};

export default UrlCard;
