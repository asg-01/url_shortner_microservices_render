import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { getUrls, deleteUrl } from '../api/urlApi';
import { getErrorMessage } from '../utils/errors';
import Navbar from '../components/Navbar';
import UrlForm from '../components/UrlForm';
import UrlCard from '../components/UrlCard';
import EditModal from '../components/EditModal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import AnalyticsSection from '../components/AnalyticsSection';
import { Link2, PlusCircle, BarChart3, Fingerprint, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { getRegisterOptions, submitRegisterCredential } from '../api/passkeyApi';
import { prepareRegistrationOptions, credentialToJSON } from '../utils/webauthn';
import './Dashboard.css';

const MAX_URLS = 4;

const DashboardHome = () => {
  const { user } = useContext(AuthContext);
  const { success, error: showError } = useContext(ToastContext);
  const navigate = useNavigate();

  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editUrl, setEditUrl] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [refreshAnalyticsTrigger, setRefreshAnalyticsTrigger] = useState(0);

  const fetchUrls = async () => {
    try {
      const response = await getUrls();
      // Backend returns an array of URL DTOs
      setUrls(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleCreated = (newUrl) => {
    setUrls((prev) => [newUrl, ...prev]);
  };

  const handleUpdated = (updatedUrl) => {
    setUrls((prev) => prev.map((u) => (u.id === updatedUrl.id ? updatedUrl : u)));
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null); // Close modal immediately
    setDeleteLoading(true); // Now we use this for full page spinner

    try {
      await new Promise(r => setTimeout(r, 2000));
      await deleteUrl(targetId);
      // DELETE returns 204 No Content — no response body
      setUrls((prev) => prev.filter((u) => u.id !== targetId));
      setRefreshAnalyticsTrigger(prev => prev + 1);
      success('URL deleted successfully!');
    } catch (err) {
      // Handled globally
    } finally {
      setDeleteLoading(false);
    }
  };

  const hasPasskeyKey = user?.email ? `hasPasskey_${user.email}` : null;
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeyAdded, setPasskeyAdded] = useState(() => {
    return hasPasskeyKey ? localStorage.getItem(hasPasskeyKey) === 'true' : false;
  });

  const handleAddPasskey = async () => {
    setPasskeyLoading(true);
    try {
      const optionsRes = await getRegisterOptions();
      const options = optionsRes.data;
      const challengeId = options.challengeId;

      const publicKey = prepareRegistrationOptions(options);
      const credential = await navigator.credentials.create({ publicKey });
      const credentialJson = JSON.stringify(credentialToJSON(credential));
      
      await submitRegisterCredential(challengeId, credentialJson);
      
      success('Passkey added successfully!');
      if (hasPasskeyKey) localStorage.setItem(hasPasskeyKey, 'true');
      setPasskeyAdded(true);
    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.message?.includes('cancel')) {
        // user cancelled
      } else {
        showError(err.response?.data?.message || 'Failed to add passkey. Your device might not support it.');
      }
    } finally {
      setPasskeyLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your URLs" fullPage={true} />;
  }

  return (
    <div className="dash-home">
      {(deleteLoading) && <LoadingSpinner fullPage={true} text="Deleting" />}
      {/* Welcome section */}
      <div className="dash-welcome">
        <div>
          <h2 className="dash-welcome-title">Welcome back, {user?.username || user?.email?.split('@')[0] || 'User'} 👋</h2>
          <p className="dash-welcome-sub">{user?.email}</p>
        </div>
        <div className="dash-url-counter">
          <span className="dash-counter-num">{urls.length}</span>
          <span className="dash-counter-sep">/</span>
          <span className="dash-counter-max">{MAX_URLS}</span>
          <span className="dash-counter-label">URLs used</span>
        </div>
      </div>

      {/* Security section */}
      <div className="dash-security-banner">
        <div className="dash-security-content">
          <div className="dash-security-icon">
            <ShieldCheck size={20} />
          </div>
          <div className="dash-security-text">
            <h4>Account Security</h4>
            <p>Faster, passwordless login with passkeys</p>
          </div>
        </div>
        <button 
          onClick={handleAddPasskey} 
          disabled={passkeyLoading || passkeyAdded}
          className={`dash-security-btn ${passkeyAdded ? 'passkey-added' : ''}`}
        >
          {passkeyLoading ? (
            <><Loader2 size={16} className="spin-animation" /> Setup...</>
          ) : passkeyAdded ? (
            <><CheckCircle2 size={16} /> Added</>
          ) : (
            <><Fingerprint size={16} /> Add Passkey</>
          )}
        </button>
      </div>

      {/* URL creation */}
      <UrlForm onCreated={handleCreated} disabled={urls.length >= MAX_URLS} />

      {/* URL list */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h3 className="dash-section-title">
            <Link2 size={20} /> My URLs
          </h3>
        </div>

        {urls.length === 0 ? (
          <div className="dash-empty">
            <div className="dash-empty-icon">
              <PlusCircle size={48} />
            </div>
            <h3>No short links yet</h3>
            <p>Create your first short URL to get started.</p>
          </div>
        ) : (
          <div className="dash-url-list">
            {urls.map((url) => (
              <UrlCard
                key={url.id}
                url={url}
                onEdit={(u) => setEditUrl(u)}
                onDelete={(u) => setDeleteTarget(u)}
                onStatusChange={handleUpdated}
                onAnalyticsClick={() => {
                  const el = document.getElementById('analytics-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsSection refreshTrigger={refreshAnalyticsTrigger} />

      {/* Edit Modal */}
      <EditModal
        isOpen={!!editUrl}
        onClose={() => setEditUrl(null)}
        url={editUrl}
        onUpdated={handleUpdated}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete URL"
        message="Are you sure you want to delete this URL?"
        confirmText="Delete"
        loading={deleteLoading}
      />
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Navbar />
      <main className="dashboard-main">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="urls" element={<DashboardHome />} />
        </Routes>
      </main>
    </div>
  );
};

export default Dashboard;
