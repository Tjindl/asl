import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo">
          {/* Hand-in-lens icon */}
          <svg className="nav-logo-icon" width="28" height="28" viewBox="0 0 28 28" fill="none">
            {/* Outer lens circle */}
            <circle cx="14" cy="14" r="12.5" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
            {/* Inner glow ring */}
            <circle cx="14" cy="14" r="9.5" stroke="currentColor" strokeWidth="0.75" opacity="0.25" />
            {/* Stylized hand - palm and fingers */}
            <path
              d="M14 19.5v-3.5M11.5 16l-1.2-4.5a1 1 0 0 1 1.94-.5L13.5 15M14 11.5V8a1 1 0 1 1 2 0v7M16 16V9.5a1 1 0 1 1 2 0V15M18 15v-3.5a1 1 0 1 1 2 0V15a6 6 0 0 1-6 6h-1a5 5 0 0 1-4.5-2.8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="nav-logo-text">SignLens</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link
            to="/recognition"
            className={`nav-link ${location.pathname === '/recognition' ? 'active' : ''}`}
          >
            Recognition
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
