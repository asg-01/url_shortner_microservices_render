import api from './api';

/**
 * POST /api/users/signup
 * Public — no JWT required.
 *
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {Promise} Axios response
 */
export const signupUser = (username, email, password) => {
  return api.post('/api/users/signup', { username, email, password }, { _silentError: true });
};

/**
 * POST /api/users/login
 * Public — no JWT required.
 *
 * The backend returns a JWT. The exact shape of the response body may vary;
 * the caller is responsible for extracting the token.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise} Axios response
 */
export const loginUser = (email, password) => {
  return api.post('/api/users/login', { email, password }, { _silentError: true });
};
