import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ToastContext } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import './Auth.css';

const Auth = () => {
  const { login, signup, token } = useContext(AuthContext);
  const { success, error: showError } = useContext(ToastContext);
  const navigate = useNavigate();
  const location = useLocation();
  const isSignupRoute = location.pathname === '/signup';

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const [isLoginActive, setIsLoginActive] = useState(!isSignupRoute);

  /* Login state */
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  /* Signup state */
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      // Fake delay for animation
      await new Promise(r => setTimeout(r, 3000));
      await login(loginEmail, loginPassword);
      success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error || '';
      
      if (status === 401 || msg.toLowerCase().includes('invalid email') || msg.toLowerCase().includes('password')) {
        setLoginError('Invalid email or password');
      } else {
        setLoginError('Something went wrong. Please try again.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters.');
      setSignupLoading(false);
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      setSignupLoading(false);
      return;
    }

    try {
      // Fake delay for animation
      await new Promise(r => setTimeout(r, 3000));
      await signup(signupUsername, signupEmail, signupPassword);
      success('Account created successfully! Please log in.');
      setIsLoginActive(true);
      setLoginEmail(signupEmail);
      setSignupUsername('');
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.error || '';
      
      if (msg && msg.toLowerCase().includes('duplicate entry')) {
        setSignupError('Email already registered. Try to log in.');
      } else if (status === 400 && msg) {
        setSignupError(msg);
      } else {
        setSignupError('Something went wrong. Please try again.');
      }
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {(loginLoading || signupLoading) && (
        <LoadingSpinner fullPage={true} text={loginLoading ? "Signing in" : "Creating account"} />
      )}
      {/* Background effects */}
      <div className="auth-bg-gradient"></div>

      <Link to="/" className="auth-back-link">
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <section className="auth-container">
        <h1 className="auth-brand">Shortify</h1>
        <div className="auth-forms">
          {/* Login wrapper */}
          <div className={`form-wrapper ${isLoginActive ? 'is-active' : ''}`}>
            <button
              type="button"
              className="switcher switcher-login"
              onClick={() => setIsLoginActive(true)}
            >
              Login
              <span className="underline"></span>
            </button>
            <form className="form form-login" onSubmit={handleLogin}>
              <fieldset>
                <legend>Please, enter your email and password for login.</legend>
                {loginError && <div className="auth-error">{loginError}</div>}
                <div className="input-block">
                  <label htmlFor="login-email">E-mail</label>
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="input-block">
                  <label htmlFor="login-password">Password</label>
                  <div className="input-password-wrapper">
                    <input
                      id="login-password"
                      name="password"
                      type={showLoginPass ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowLoginPass(!showLoginPass)}
                      aria-label={showLoginPass ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </fieldset>
              <button type="submit" className="btn-login" disabled={loginLoading}>
                {loginLoading ? (
                  <>⟳ Signing in...</>
                ) : (
                  'Login'
                )}
              </button>
              <p className="auth-switch-text">
                Don't have an account? <button type="button" className="auth-switch-link" onClick={() => setIsLoginActive(false)}>Sign up</button>
              </p>
            </form>
          </div>

          {/* Signup wrapper */}
          <div className={`form-wrapper ${!isLoginActive ? 'is-active' : ''}`}>
            <button
              type="button"
              className="switcher switcher-signup"
              onClick={() => setIsLoginActive(false)}
            >
              Sign Up
              <span className="underline"></span>
            </button>
            <form className="form form-signup" onSubmit={handleSignup}>
              <fieldset>
                <legend>Please, enter your details for sign up.</legend>
                {signupError && <div className="auth-error">{signupError}</div>}
                <div className="input-block">
                  <label htmlFor="signup-username">Username</label>
                  <input
                    id="signup-username"
                    name="username"
                    type="text"
                    required
                    value={signupUsername}
                    onChange={(e) => setSignupUsername(e.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="input-block">
                  <label htmlFor="signup-email">E-mail</label>
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="input-block">
                  <label htmlFor="signup-password">Password</label>
                  <div className="input-password-wrapper">
                    <input
                      id="signup-password"
                      name="password"
                      type={showSignupPass ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowSignupPass(!showSignupPass)}
                      aria-label={showSignupPass ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="input-block">
                  <label htmlFor="signup-confirm">Confirm Password</label>
                  <input
                    id="signup-confirm"
                    name="confirm-password"
                    type="password"
                    required
                    value={signupConfirm}
                    onChange={(e) => setSignupConfirm(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>
              </fieldset>
              <button type="submit" className="btn-signup" disabled={signupLoading}>
                {signupLoading ? (
                  <>⟳ Creating account...</>
                ) : (
                  'Sign Up'
                )}
              </button>
              <p className="auth-switch-text">
                Already have an account? <button type="button" className="auth-switch-link" onClick={() => setIsLoginActive(true)}>Login</button>
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Auth;
