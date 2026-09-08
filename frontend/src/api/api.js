import axios from 'axios';

/**
 * Base Axios instance.
 * 
 * In development with the Vite proxy, requests to /api/* are forwarded
 * to http://localhost:8080 automatically.
 * 
 * In production, VITE_API_URL should be set to the real API origin
 * (e.g. https://api.yourdomain.com).
 */
const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach JWT to every request EXCEPT public routes ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isPublicRoute = config.url.includes('/users/login') || config.url.includes('/users/signup');
    
    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle errors globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Allow specific calls to opt out of global error toasts
    if (error.config?._silentError) {
      return Promise.reject(error);
    }

    if (!error.response) {
      // Network error or timeout
      window.dispatchEvent(new CustomEvent('api-toast', { 
        detail: { type: 'error', message: 'Network error. Please check your connection.' } 
      }));
      return Promise.reject(error);
    }

    const status = error.response.status;
    const isAuthRoute = error.config?.url?.includes('/users/login') || error.config?.url?.includes('/users/signup');
    const serverMessage = error.response.data?.message || error.response.data?.error;

    if (status === 400) {
      if (isAuthRoute) {
        window.dispatchEvent(new CustomEvent('api-toast', { 
          detail: { type: 'error', message: 'Please check your information and try again.' } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('api-toast', { 
          detail: { type: 'error', message: 'Invalid request. Please check your information.' } 
        }));
      }
    } else if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('unauthorized'));
      
      if (isAuthRoute) {
        window.dispatchEvent(new CustomEvent('api-toast', { 
          detail: { type: 'error', message: 'Incorrect email or password.' } 
        }));
      } else {
        window.dispatchEvent(new CustomEvent('api-toast', { 
          detail: { type: 'warning', message: 'Your session has expired. Please log in again.' } 
        }));
      }
    } else if (status === 403) {
      window.dispatchEvent(new CustomEvent('api-toast', { 
        detail: { type: 'error', message: 'You don\'t have permission to perform this action.' } 
      }));
    } else if (status === 404) {
      window.dispatchEvent(new CustomEvent('api-toast', { 
        detail: { type: 'error', message: 'Requested resource was not found.' } 
      }));
    } else if (status === 409) {
      window.dispatchEvent(new CustomEvent('api-toast', { 
        detail: { type: 'warning', message: 'You\'ve already shortened this URL or a conflict occurred.' } 
      }));
    } else if (status === 429) {
      window.dispatchEvent(new CustomEvent('api-toast', { 
        detail: { type: 'warning', message: 'Too many requests. Please wait a moment before trying again.' } 
      }));
    } else if (status >= 500) {
      window.dispatchEvent(new CustomEvent('api-toast', { 
        detail: { type: 'error', message: 'Something went wrong. Please try again later.' } 
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
