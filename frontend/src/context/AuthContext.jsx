import React, { createContext, useState, useEffect, useCallback } from 'react';
import { loginUser, signupUser } from '../api/authApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
    } else if (!token) {
      setUser(null);
      localStorage.removeItem('user');
    }
    setLoading(false);
  }, [token]);

  // Listen for 401 events dispatched by the axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await loginUser(email, password);
    const data = response.data;

    // The backend returns a JWT. Adapt to common response shapes:
    //   { token: "..." }  or  { jwt: "..." }  or  { accessToken: "..." }
    //   or the JWT may be the entire response body as a plain string.
    let receivedToken = null;
    let receivedUser = null;

    if (typeof data === 'string') {
      // Backend returned the JWT as a raw string
      receivedToken = data;
      receivedUser = { email };
    } else if (typeof data === 'object' && data !== null) {
      receivedToken = data.token || data.jwt || data.accessToken;
      receivedUser = data.user || {
        username: data.username,
        email: data.email || email,
      };
    }

    if (receivedToken) {
      setToken(receivedToken);
      setUser(receivedUser);
      localStorage.setItem('token', receivedToken);
      localStorage.setItem('user', JSON.stringify(receivedUser));
    } else {
      throw new Error('No token received from server.');
    }

    return response;
  }, []);

  const signup = useCallback(async (username, email, password) => {
    return await signupUser(username, email, password);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
