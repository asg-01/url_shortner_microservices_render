import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Search } from 'lucide-react';
import GenericErrorPage from './GenericErrorPage';
import { trackRedirect } from '../api/analyticsApi';
import './Redirect.css';

const AnimatedBrokenLink = ({ size = 64 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <style>
        {`
          .link-left {
            animation: slideLeft 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .link-right {
            animation: slideRight 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          }
          .strike {
            stroke: #ff5757;
            stroke-dasharray: 40;
            stroke-dashoffset: 40;
            animation: drawStrike 0.5s ease 0.5s forwards;
          }
          @keyframes slideLeft {
            0% { transform: translateX(2px) translateY(1px); }
            100% { transform: translateX(-2px) translateY(-1px); }
          }
          @keyframes slideRight {
            0% { transform: translateX(-2px) translateY(-1px); }
            100% { transform: translateX(2px) translateY(1px); }
          }
          @keyframes drawStrike {
            to { stroke-dashoffset: 0; }
          }
        `}
      </style>
      <g className="link-left">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
      </g>
      <g className="link-right">
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
      </g>
      <line x1="6" y1="18" x2="18" y2="6" className="strike"></line>
    </svg>
  );
};

/**
 * Get approximate country code from countries.dev.
 * Returns uppercase ISO code or "UNKNOWN" on any failure.
 * Times out after 3 seconds to never delay the redirect.
 */
const getVisitorCountry = async () => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch('https://countries.dev/ip', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return 'UNKNOWN';

    const data = await res.json();
    const code = data?.countryCode;

    if (code && typeof code === 'string' && code.length === 2) {
      return code.toUpperCase();
    }
    return 'UNKNOWN';
  } catch {
    return 'UNKNOWN';
  }
};

const Redirect = () => {
  const { shortCode } = useParams();
  const [errorStatus, setErrorStatus] = useState(null);
  const analyticsTracked = useRef(false);

  const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080';

  useEffect(() => {
    if (!shortCode || shortCode.length !== 6) {
      setErrorStatus(404);
      return;
    }

    const checkStatus = async () => {
      try {
        // Query the new status API
        const res = await fetch(`${GATEWAY_URL}/api/redirect/${shortCode}/status`);
        
        if (res.status === 403) {
          setErrorStatus(403);
        } else if (res.status === 404) {
          setErrorStatus(404);
        } else if (res.status === 410) {
          setErrorStatus(410);
        } else if (res.ok) {
          const data = await res.json();
          // Valid redirect — fire analytics then navigate
          await fireAnalyticsAndRedirect(data.originalUrl);
        } else {
          // Unknown error, just default to 404
          setErrorStatus(404);
        }
      } catch (err) {
        // If the API call fails completely (e.g. network down), we just show a generic error
        setErrorStatus(404);
      }
    };

    const fireAnalyticsAndRedirect = async (originalUrl) => {
      // Guard: only fire analytics once per mount
      if (analyticsTracked.current) return;
      analyticsTracked.current = true;

      // Get country (best-effort, 3s timeout)
      const region = await getVisitorCountry();

      // Fire analytics tracking (fire-and-forget, non-blocking)
      await trackRedirect(shortCode, region);

      // Navigate to the actual redirect URL
      if (originalUrl) {
        window.location.href = originalUrl;
      } else {
        // Fallback if backend doesn't return originalUrl
        window.location.href = `${GATEWAY_URL}/${shortCode}`;
      }
    };

    checkStatus();
  }, [shortCode, GATEWAY_URL]);

  const isLoggedIn = !!localStorage.getItem('token');

  if (errorStatus === 403) {
    return (
      <GenericErrorPage
        icon={AnimatedBrokenLink}
        title="Link Disabled"
        message={<>This short link has been temporarily disabled<br/>by its owner.</>}
        actionText={isLoggedIn ? "← Back to Home" : undefined}
      />
    );
  }

  if (errorStatus === 410) {
    return (
      <GenericErrorPage
        icon={Clock}
        title="Link Expired"
        message={<>This short link has expired<br/>and is no longer available.</>}
        actionText={isLoggedIn ? "← Back to Home" : undefined}
      />
    );
  }

  if (errorStatus === 404) {
    return (
      <GenericErrorPage
        icon={Search}
        title="Link Not Found"
        message={<>This short link doesn't exist<br/>or has been removed.</>}
        actionText={isLoggedIn ? "← Back to Home" : undefined}
      />
    );
  }

  return (
    <div className="redirect-page">
      <div className="redirect-card">
        <div className="redirect-tetrominos">
          <div className="redirect-tetromino redirect-box1"></div>
          <div className="redirect-tetromino redirect-box2"></div>
          <div className="redirect-tetromino redirect-box3"></div>
          <div className="redirect-tetromino redirect-box4"></div>
        </div>
        <h2 className="redirect-title">Redirecting...</h2>
        <p className="redirect-sub">Taking you to your destination</p>
      </div>
    </div>
  );
};

export default Redirect;
