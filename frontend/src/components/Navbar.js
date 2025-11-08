import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          ASL Recognition
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/recognition">Recognition</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
