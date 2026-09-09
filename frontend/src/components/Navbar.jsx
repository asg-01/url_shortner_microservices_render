import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User, Loader2 } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
    }, 800);
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">Shortify</Link>
      </div>
      <div className="navbar-right">
        <div className="navbar-user">
          <div className="navbar-avatar">
            <User size={16} />
          </div>
          <span className="navbar-username">{user?.username || user?.email || 'User'}</span>
        </div>
        <button 
          className="navbar-logout-btn" 
          onClick={handleLogout} 
          disabled={isLoggingOut}
          aria-label="Log out"
        >
          {isLoggingOut ? <Loader2 size={18} className="spin-animation" /> : <LogOut size={18} />}
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
