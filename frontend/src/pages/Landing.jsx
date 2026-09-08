import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Link2, Share2, QrCode, BarChart3, Shield, Zap, ArrowRight, ChevronRight } from 'lucide-react';
import './Landing.css';

const features = [
  { icon: <Link2 size={28} />, title: 'Shorten URLs', desc: 'Transform long, ugly links into clean, memorable short URLs in seconds.' },
  { icon: <Share2 size={28} />, title: 'Easy Sharing', desc: 'Share your links instantly via WhatsApp, email, or any platform.' },
  { icon: <QrCode size={28} />, title: 'QR Codes', desc: 'Generate beautiful QR codes for every short link. Download and share.' },
  { icon: <BarChart3 size={28} />, title: 'Analytics', desc: 'Track clicks, locations, and performance of every link you share.' },
  { icon: <Shield size={28} />, title: 'Secure', desc: 'Enterprise-grade security with JWT authentication and encrypted data.' },
  { icon: <Zap size={28} />, title: 'Lightning Fast', desc: 'Powered by Redis caching for instant redirects under 50ms.' },
];

const steps = [
  { num: '01', title: 'Create an account', desc: 'Sign up in seconds with just your email.' },
  { num: '02', title: 'Shorten your URL', desc: 'Paste any long URL and get a clean short link.' },
  { num: '03', title: 'Share your link', desc: 'Share via QR code, WhatsApp, email, or copy.' },
  { num: '04', title: 'Track performance', desc: 'Monitor clicks and engagement in real-time.' },
];

const Landing = () => {
  const { token } = useContext(AuthContext);

  return (
    <div className="landing">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-inner container">
          <span className="landing-logo">Shortify</span>
          <nav className="landing-nav">
            {token ? (
              <Link to="/dashboard" className="landing-btn-cta-small">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="landing-nav-link">Login</Link>
                <Link to="/signup" className="landing-btn-cta-small">
                  Get Started <ArrowRight size={16} />
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <div className="landing-hero-bg"></div>
        <div className="container landing-hero-inner">
          <div className="landing-hero-badge">✨ The modern URL shortener</div>
          <h1 className="landing-hero-title">
            Shorten links.<br />
            <span className="gradient-text">Share faster.</span><br />
            Track better.
          </h1>
          <p className="landing-hero-sub">
            Create short, branded links in seconds. Share them anywhere. Track every click. All in one powerful, free platform.
          </p>
          <div className="landing-hero-actions">
            {token ? (
              <Link to="/dashboard" className="landing-btn-primary">
                Go to Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/signup" className="landing-btn-primary">
                  Start Shortening — It's Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="landing-btn-secondary">
                  Login to Dashboard <ChevronRight size={18} />
                </Link>
              </>
            )}
          </div>
          <div className="landing-hero-stats">
            <div className="stat-item">
              <span className="stat-num">10K+</span>
              <span className="stat-label">Links Created</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">50ms</span>
              <span className="stat-label">Avg Redirect</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-num">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features" id="features">
        <div className="container">
          <div className="landing-section-header">
            <span className="landing-overline">Features</span>
            <h2 className="landing-section-title">Everything you need to manage your links</h2>
            <p className="landing-section-sub">Powerful tools designed for modern link management.</p>
          </div>
          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card glass-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="landing-steps">
        <div className="container">
          <div className="landing-section-header">
            <span className="landing-overline">How it works</span>
            <h2 className="landing-section-title">Get started in minutes</h2>
          </div>
          <div className="landing-steps-grid">
            {steps.map((s, i) => (
              <div key={i} className="step-card">
                <span className="step-num">{s.num}</span>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <div className="container">
          <div className="landing-cta-card">
            <h2 className="landing-cta-title">{token ? 'Manage your links efficiently' : 'Ready to shorten your first link?'}</h2>
            <p className="landing-cta-sub">{token ? 'Head to your dashboard to create, track, and manage all your links.' : 'Join thousands of users managing their links with Shortify.'}</p>
            <Link to={token ? '/dashboard' : '/signup'} className="landing-btn-primary landing-btn-lg">
              {token ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <div className="landing-footer-inner">
            <span className="landing-logo">Shortify</span>
            <p className="landing-footer-copy">&copy; {new Date().getFullYear()} Shortify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
