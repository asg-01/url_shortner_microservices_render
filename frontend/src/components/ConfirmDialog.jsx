import React from 'react';
import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm', message, confirmText = 'Delete', loading = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="confirm-dialog">
        <div className="confirm-icon">
          <AlertTriangle size={40} />
        </div>
        <p className="confirm-message">{message}</p>
        <p className="confirm-sub">This action cannot be undone.</p>
        <div className="confirm-actions">
          <button className="confirm-btn-cancel" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="confirm-btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
