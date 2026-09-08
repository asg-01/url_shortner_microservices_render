import React, { useState, useContext } from 'react';
import { Link2 } from 'lucide-react';
import { createUrl } from '../api/urlApi';
import { ToastContext } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { isValidUrl } from '../utils/url';
import LoadingSpinner from './LoadingSpinner';
import './UrlForm.css';

const UrlForm = ({ onCreated, disabled = false }) => {
  const { success, error: showError } = useContext(ToastContext);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!url.trim()) {
      setValidationError('Please enter a URL.');
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    if (!isValidUrl(finalUrl)) {
      setValidationError('Please enter a valid URL.');
      return;
    }

    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const response = await createUrl(finalUrl);
      success('URL created successfully!');
      setUrl('');
      if (onCreated) onCreated(response.data);
    } catch (err) {
      const msg = getErrorMessage(err);
      setValidationError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingSpinner fullPage={true} text="Creating short link" />}
      <form className="url-form" onSubmit={handleSubmit}>
      <div className="url-form-inner">
        <div className="url-form-icon">
          <Link2 size={20} />
        </div>
        <input
          type="text"
          className="url-form-input"
          placeholder="Paste your long URL here..."
          value={url}
          onChange={(e) => { setUrl(e.target.value); setValidationError(''); }}
          disabled={loading || disabled}
          aria-label="Enter URL to shorten"
        />
        <button
          type="submit"
          className="url-form-btn"
          disabled={loading || disabled}
        >
          {loading ? 'Creating...' : 'Shorten URL'}
        </button>
      </div>
      {validationError && <p className="url-form-error">{validationError}</p>}
      {disabled && <p className="url-form-limit">You've reached your URL limit.</p>}
    </form>
    </>
  );
};

export default UrlForm;
