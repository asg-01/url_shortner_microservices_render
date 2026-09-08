import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Redirect from './pages/Redirect';
import NotFound from './pages/NotFound';
import ServerError from './pages/ServerError';
import ServiceUnavailable from './pages/ServiceUnavailable';
import TooManyRequests from './pages/TooManyRequests';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Toast />
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />

            {/* Protected */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Error pages */}
            <Route path="/error" element={<ServerError />} />
            <Route path="/unavailable" element={<ServiceUnavailable />} />
            <Route path="/too-many-requests" element={<TooManyRequests />} />

            {/* Short URL redirect — matches 6-char codes */}
            <Route path="/:shortCode" element={<Redirect />} />

            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
