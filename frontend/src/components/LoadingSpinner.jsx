import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ text = 'Loading', size = 'md', fullPage = false }) => {
  return (
    <div className={`spinner-wrapper ${fullPage ? 'spinner-fullpage' : ''}`}>
      <div className={`spinner-ring spinner-${size}`}></div>
      {text && <p className="spinner-text">{text}&#8230;</p>}
    </div>
  );
};

export default LoadingSpinner;
