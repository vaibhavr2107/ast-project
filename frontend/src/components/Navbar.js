import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <img src="https://cdn-icons-png.flaticon.com/512/9817/9817085.png" alt="Logo" />
        Dashboard
      </div>
    </nav>
  );
}

export default Navbar;
