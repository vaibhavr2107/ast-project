import React from 'react';
import { NavLink } from 'react-router-dom';

function Sidebar() {
  return (
    <aside className="sidebar">
      <h1 className="sidebar__title">Welcome to Platform Dashboard</h1>
      <nav className="sidebar__nav">
        <NavLink to="/" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828765.png" alt="Dashboard" />
          Dashboard
        </NavLink>
        <NavLink to="/stash" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <img src="https://cdn-icons-png.flaticon.com/512/6125/6125001.png" alt="Stash" />
          Stash Copy
        </NavLink>
        <NavLink to="/parser" className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}>
          <img src="https://cdn-icons-png.flaticon.com/512/6125/6125001.png" alt="Stash" />
          Parser
        </NavLink>
        
      </nav>
    </aside>
  );
}

export default Sidebar;