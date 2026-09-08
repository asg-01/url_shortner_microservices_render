import React from 'react';
import Modal from './Modal';
import { Copy, Mail, MessageCircle, ExternalLink } from 'lucide-react';
import { getPublicShortUrl } from '../utils/url';
import './ShareModal.css';

const ShareModal = ({ isOpen, onClose, shortCode, onCopy }) => {
  const publicUrl = getPublicShortUrl(shortCode);

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Check this link', url: publicUrl });
      } catch { /* cancelled */ }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicUrl);
    if (onCopy) onCopy();
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(publicUrl)}`, '_blank');
  };

  const handleEmail = () => {
    window.open(`mailto:?subject=Check out this link&body=${encodeURIComponent(publicUrl)}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Link" size="sm">
      <div className="share-modal-body">
        <div className="share-url-display">
          <span>{publicUrl}</span>
        </div>
        <div className="share-options">
          {navigator.share && (
            <button className="share-option" onClick={handleNativeShare}>
              <ExternalLink size={20} />
              <span>Native Share</span>
            </button>
          )}
          <button className="share-option" onClick={handleCopy}>
            <Copy size={20} />
            <span>Copy Link</span>
          </button>
          <button className="share-option share-whatsapp" onClick={handleWhatsApp}>
            <MessageCircle size={20} />
            <span>WhatsApp</span>
          </button>
          <button className="share-option share-email" onClick={handleEmail}>
            <Mail size={20} />
            <span>Email</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
