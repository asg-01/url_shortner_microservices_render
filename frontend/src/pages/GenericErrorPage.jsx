import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPage.css';

const GenericErrorPage = ({ code, title, message, icon: Icon, actionText = 'Go back home', actionLink = '/' }) => {
  return (
    <div className="error-page">
      <div className="error-card">
        {Icon && (
          <div className="error-icon">
            <Icon size={64} />
          </div>
        )}
        {code && <h1 className="error-code">{code}</h1>}
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        <Link to={actionLink} className="error-home-link">
          {actionText}
        </Link>
      </div>
    </div>
  );
};

export default GenericErrorPage;
