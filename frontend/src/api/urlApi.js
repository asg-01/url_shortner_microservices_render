import api from './api';

/**
 * GET /api/urls
 * JWT REQUIRED.
 * Returns an array of the current user's URL DTOs.
 *
 * Response shape:
 * [{ id, originalUrl, shortCode, expiresAt }]
 *
 * @returns {Promise} Axios response
 */
export const getUrls = () => {
  return api.get('/api/urls');
};

/**
 * POST /api/urls
 * JWT REQUIRED.
 * Creates a new shortened URL.
 *
 * Request:  { originalUrl: "https://..." }
 * Response: { id, originalUrl, shortCode, expiresAt }
 *
 * Backend automatically:
 *  - validates the URL
 *  - checks for duplicates (same user + same URL)
 *  - enforces the 4-URL limit
 *  - generates a 6-char short code via Redis atomic counter
 *  - persists to MySQL
 *
 * @param {string} originalUrl
 * @returns {Promise} Axios response
 */
export const createUrl = (originalUrl) => {
  return api.post('/api/urls', { originalUrl });
};

/**
 * PUT /api/urls/{id}
 * JWT REQUIRED.
 * Updates the original URL. The shortCode stays the same.
 *
 * Request:  { originalUrl: "https://new-url.com" }
 * Response: { id, originalUrl, shortCode, expiresAt }
 *
 * @param {number} id
 * @param {string} originalUrl
 * @returns {Promise} Axios response
 */
export const updateUrl = (id, originalUrl) => {
  return api.put(`/api/urls/${id}`, { originalUrl });
};

/**
 * PUT /api/urls/{id}/status?active={bool}
 * JWT REQUIRED.
 * Updates the active status of the URL.
 * 
 * @param {number} id 
 * @param {boolean} active 
 * @returns {Promise} Axios response
 */
export const toggleUrlStatus = (id, active) => {
  return api.put(`/api/urls/${id}/status?active=${active}`);
};

/**
 * DELETE /api/urls/{id}
 * JWT REQUIRED.
 * Deletes the URL. Returns 204 No Content (no body).
 *
 * @param {number} id
 * @returns {Promise} Axios response
 */
export const deleteUrl = (id) => {
  return api.delete(`/api/urls/${id}`);
};
