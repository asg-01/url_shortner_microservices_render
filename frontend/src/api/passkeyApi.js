import api from './api';

/**
 * Get options for passkey registration
 * POST /api/auth/passkey/register/options
 * Requires JWT
 */
export const getRegisterOptions = () => {
  return api.post('/api/auth/passkey/register/options');
};

/**
 * Submit credential for passkey registration
 * POST /api/auth/passkey/register
 * Requires JWT
 * @param {string} challengeId 
 * @param {string} credential - JSON stringified credential
 */
export const submitRegisterCredential = (challengeId, credential) => {
  return api.post('/api/auth/passkey/register', { challengeId, credential });
};

/**
 * Get options for passkey login
 * POST /api/auth/passkey/login/options
 * No JWT required
 */
export const getLoginOptions = () => {
  // Use _silentError to prevent global toasts on Expected errors during login flow
  return api.post('/api/auth/passkey/login/options', {}, { _silentError: true });
};

/**
 * Submit credential for passkey login
 * POST /api/auth/passkey/login
 * No JWT required
 * @param {string} challengeId 
 * @param {string} credential - JSON stringified credential
 */
export const submitLoginCredential = (challengeId, credential) => {
  return api.post('/api/auth/passkey/login', { challengeId, credential }, { _silentError: true });
};
