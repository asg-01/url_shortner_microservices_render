import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

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
        <button className="navbar-logout-btn" onClick={logout} aria-label="Log out">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
