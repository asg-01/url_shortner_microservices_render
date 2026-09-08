import React, { useState, useContext } from 'react';
import Modal from './Modal';
import { updateUrl } from '../api/urlApi';
import { ToastContext } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { isValidUrl } from '../utils/url';
import LoadingSpinner from './LoadingSpinner';
import './EditModal.css';

const EditModal = ({ isOpen, onClose, url, onUpdated }) => {
  const { success, error: showError } = useContext(ToastContext);
  const [newUrl, setNewUrl] = useState(url?.originalUrl || '');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!newUrl.trim()) {
      setValidationError('Please enter a URL.');
      return;
    }
    let finalUrl = newUrl.trim();
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
      const response = await updateUrl(url.id, finalUrl);
      success('URL updated successfully!');
      if (onUpdated) onUpdated(response.data);
      onClose();
    } catch (err) {
      const msg = getErrorMessage(err);
      setValidationError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when URL prop changes
  React.useEffect(() => {
    if (url) setNewUrl(url.originalUrl);
  }, [url]);

  return (
    <>
      {loading && <LoadingSpinner fullPage={true} text="Updating" />}
      <Modal isOpen={isOpen && !loading} onClose={onClose} title="Edit URL" size="md">
      <form className="edit-modal-form" onSubmit={handleSubmit}>
        <div className="edit-modal-info">
          <span className="edit-modal-label">Short Code</span>
          <span className="edit-modal-code">{url?.shortCode}</span>
        </div>
        <div className="edit-modal-field">
          <label htmlFor="edit-url" className="edit-modal-label">New Original URL</label>
          <input
            id="edit-url"
            type="text"
            className="edit-modal-input"
            value={newUrl}
            onChange={(e) => { setNewUrl(e.target.value); setValidationError(''); }}
            placeholder="https://example.com/new-url"
            disabled={loading}
          />
          {validationError && <p className="edit-modal-error">{validationError}</p>}
        </div>
        <div className="edit-modal-actions">
          <button type="button" className="edit-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="edit-btn-save" disabled={loading}>
            {loading ? 'Updating...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
    </>
  );
};

export default EditModal;
