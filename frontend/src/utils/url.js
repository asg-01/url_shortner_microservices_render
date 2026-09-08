const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || window.location.origin;

/**
 * Build the full public short URL for display/sharing/QR
 * @param {string} shortCode 
 * @returns {string}
 */
export const getPublicShortUrl = (shortCode) => {
  return `${PUBLIC_URL}/${shortCode}`;
};

/**
 * Format an expiration date string to a readable format
 * @param {string} dateStr ISO date string
 * @returns {string}
 */
export const formatExpirationDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get remaining days until expiration
 * @param {string} dateStr ISO date string
 * @returns {number} days remaining (negative if expired)
 */
export const getDaysRemaining = (dateStr) => {
  const expDate = new Date(dateStr);
  const now = new Date();
  const diff = expDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Get a human-readable expiration status string
 * @param {string} dateStr ISO date string
 * @returns {{ text: string, isExpired: boolean }}
 */
export const getExpirationStatus = (dateStr) => {
  const days = getDaysRemaining(dateStr);
  if (days < 0) {
    return { text: 'Expired', isExpired: true };
  }
  if (days === 0) {
    return { text: 'Expires today', isExpired: false };
  }
  if (days === 1) {
    return { text: 'Expires tomorrow', isExpired: false };
  }
  if (days <= 30) {
    return { text: `Expires in ${days} days`, isExpired: false };
  }
  if (days <= 365) {
    const months = Math.floor(days / 30);
    return { text: `Expires in ${months} month${months > 1 ? 's' : ''}`, isExpired: false };
  }
  return { text: `Expires on ${formatExpirationDate(dateStr)}`, isExpired: false };
};

/**
 * Validate a URL string
 * @param {string} url 
 * @returns {boolean}
 */
export const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Truncate a URL for display
 * @param {string} url 
 * @param {number} maxLen 
 * @returns {string}
 */
export const truncateUrl = (url, maxLen = 50) => {
  if (url.length <= maxLen) return url;
  return url.substring(0, maxLen) + '…';
};
