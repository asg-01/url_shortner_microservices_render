import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fingerprint, ShieldCheck, Zap, ArrowRight, X, Loader2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { getRegisterOptions, submitRegisterCredential } from '../api/passkeyApi';
import { prepareRegistrationOptions, credentialToJSON } from '../utils/webauthn';
import './PasskeySetup.css';

const PasskeySetup = () => {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setPasskeyPromptSeen, token } = useContext(AuthContext);
  const { success, error } = useContext(ToastContext);

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const handleSkip = () => {
    setPasskeyPromptSeen();
    navigate('/dashboard');
  };

  const handleAddPasskey = async () => {
    setLoading(true);
    try {
      // 1. Get options from backend
      const optionsRes = await getRegisterOptions();
      const options = optionsRes.data;
      const challengeId = options.challengeId;

      // 2. Prepare options for WebAuthn API
      const publicKey = prepareRegistrationOptions(options);

      // 3. Prompt user to create passkey
      const credential = await navigator.credentials.create({ publicKey });

      // 4. Send credential to backend
      const credentialJson = JSON.stringify(credentialToJSON(credential));
      await submitRegisterCredential(challengeId, credentialJson);

      success('Passkey added successfully!');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          if (payload.sub) {
            localStorage.setItem(`hasPasskey_${payload.sub}`, 'true');
          }
        } catch (e) {
          // Ignore
        }
      }
      setPasskeyPromptSeen();
      setAdded(true);
    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError' || err.message.includes('cancel')) {
        error('Passkey setup cancelled.');
      } else if (err.response) {
        error(err.response.data?.message || 'Failed to register passkey on server.');
      } else {
        error('Failed to create passkey. Your device might not support it.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="passkey-page">
      {/* Ambient background glows */}
      <div className="passkey-glow passkey-glow-top" aria-hidden />
      <div className="passkey-glow passkey-glow-bottom" aria-hidden />

      {/* Skip for now — top right */}
      {!added && (
        <button onClick={handleSkip} className="passkey-skip-top">
          Skip for now
          <X size={16} />
        </button>
      )}

      <div className="passkey-container">
        <div className="passkey-card">
          {/* Icon */}
          <div className="passkey-icon-wrapper">
            <div className={`passkey-icon-inner ${loading ? 'pulse' : ''}`}>
              <Fingerprint className="passkey-icon animate-fingerprint" />
            </div>
          </div>

          {added ? (
            <div className="passkey-content">
              <h1 className="passkey-title">Passkey added</h1>
              <p className="passkey-desc">
                You're all set. Next time, sign in with your face, fingerprint,
                or device PIN — no password needed.
              </p>
              <button onClick={() => navigate('/dashboard')} className="passkey-btn passkey-btn-primary mt-32">
                Go to dashboard
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="passkey-content">
              <p className="passkey-subtitle">One last step</p>
              <h1 className="passkey-title">
                Add a <span className="text-gradient-accent">passkey</span> for faster login
              </h1>
              <p className="passkey-desc">
                Sign in instantly with your face, fingerprint, or device PIN.
                Passkeys are more secure than passwords and never leave your device.
              </p>

              {/* Benefits */}
              <ul className="passkey-benefits">
                <li className="passkey-benefit-item">
                  <div className="passkey-benefit-icon glow-accent-small">
                    <Zap size={16} />
                  </div>
                  <div>
                    <p className="passkey-benefit-title">Sign in in seconds</p>
                    <p className="passkey-benefit-text">No password to type or remember</p>
                  </div>
                </li>
                <li className="passkey-benefit-item">
                  <div className="passkey-benefit-icon glow-purple-small">
                    <ShieldCheck size={16} />
                  </div>
                  <div>
                    <p className="passkey-benefit-title">Phishing-proof security</p>
                    <p className="passkey-benefit-text">Works only on Shortify — can't be stolen</p>
                  </div>
                </li>
              </ul>

              {/* Actions */}
              <div className="passkey-actions">
                <button 
                  onClick={handleAddPasskey} 
                  className="passkey-btn passkey-btn-primary"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={16} className="spin-animation" /> : <Fingerprint size={16} />}
                  {loading ? 'Setting up...' : 'Add passkey'}
                </button>
                <button onClick={handleSkip} className="passkey-btn passkey-btn-secondary" disabled={loading}>
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasskeySetup;
