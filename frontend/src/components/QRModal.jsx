import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import Modal from './Modal';
import { Download, Share2 } from 'lucide-react';
import { getPublicShortUrl } from '../utils/url';
import LoadingSpinner from './LoadingSpinner';
import './QRModal.css';

const QRModal = ({ isOpen, onClose, shortCode }) => {
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const publicUrl = getPublicShortUrl(shortCode);

  React.useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleDownload = () => {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-${shortCode}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const canvas = canvasRef.current?.querySelector('canvas');
        if (canvas) {
          canvas.toBlob(async (blob) => {
            const file = new File([blob], `qr-${shortCode}.png`, { type: 'image/png' });
            await navigator.share({ title: 'QR Code', text: `Scan this QR for: ${publicUrl}`, files: [file] });
          });
        }
      } catch {
        // User cancelled or share failed
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code" size="sm">
      <div className="qr-modal-body" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {isLoading ? (
          <LoadingSpinner size="lg" text="Generating QR" />
        ) : (
          <>
            <div className="qr-canvas-wrapper" ref={canvasRef}>
              <QRCodeCanvas
                value={publicUrl}
                size={220}
                bgColor="#ffffff"
                fgColor="#0a0e1a"
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="qr-url">{publicUrl}</p>
            <div className="qr-actions">
              <button className="qr-btn qr-btn-download" onClick={handleDownload}>
                <Download size={16} /> Download
              </button>
              {navigator.share && (
                <button className="qr-btn qr-btn-share" onClick={handleShare}>
                  <Share2 size={16} /> Share
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default QRModal;
