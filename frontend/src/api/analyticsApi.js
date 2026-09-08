import api from './api';

const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080';

/**
 * POST /api/analytics/track
 * 
 * PUBLIC — no JWT required.
 * Uses raw fetch() instead of the Axios instance so that:
 *   1. No JWT is attached (anonymous visitors)
 *   2. No global error interceptor fires on failure
 *   3. Analytics failure is always silent / non-blocking
 * 
 * @param {string} shortCode — the 6-char short code
 * @param {string} region — ISO country code or "UNKNOWN"
 * @returns {Promise<void>}
 */
export const trackRedirect = async (shortCode, region) => {
  try {
    await fetch(`${GATEWAY_URL}/api/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shortCode, region }),
    });
  } catch {
    // Silently ignore — analytics must never block redirect
  }
};

/**
 * GET /api/analytics/dashboard
 * 
 * JWT REQUIRED (authenticated user's analytics).
 * Returns the full analytics dashboard payload.
 * 
 * Expected response shape:
 * {
 *   summary: {
 *     totalRedirects: number,
 *     last24h: number,
 *     last30d: number,
 *     last1y: number,
 *   },
 *   regions: [
 *     { region: "IN", redirectCount: 1500 },
 *     { region: "US", redirectCount: 800 },
 *     ...
 *   ],
 *   urlAnalytics: [
 *     {
 *       urlId: number,
 *       shortCode: string,
 *       originalUrl: string,
 *       active: boolean,
 *       totalRedirects: number,
 *       last24h: number,
 *       last30d: number,
 *       last1y: number,
 *       topRegion: string,
 *     },
 *     ...
 *   ],
 *   lastSyncedAt: string (ISO date) | null,
 * }
 * 
 * @returns {Promise} Axios response
 */
export const getAnalyticsDashboard = () => {
  return api.get('/api/analytics/dashboard', { _silentError: true });
};

/**
 * POST /api/analytics/sync
 * 
 * JWT REQUIRED (admin/user triggers manual sync).
 * Flushes dirty Redis analytics buckets to MySQL.
 * 
 * @returns {Promise} Axios response
 */
export const syncAnalytics = () => {
  return api.post('/api/analytics/sync', {}, { _silentError: true });
};
