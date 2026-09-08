import React, { createContext, useState, useCallback, useEffect } from 'react';

export const ToastContext = createContext();

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error', 6000), [addToast]);
  const warning = useCallback((msg) => addToast(msg, 'warning', 5000), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  useEffect(() => {
    const handleApiToast = (event) => {
      const { type, message } = event.detail;
      if (type === 'error') error(message);
      else if (type === 'warning') warning(message);
      else if (type === 'success') success(message);
      else info(message);
    };

    window.addEventListener('api-toast', handleApiToast);
    return () => window.removeEventListener('api-toast', handleApiToast);
  }, [error, warning, success, info]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error, warning, info }}>
      {children}
    </ToastContext.Provider>
  );
};
