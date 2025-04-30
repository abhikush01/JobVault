import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import './JobSeekerDashboard.css';

const JobSeekerDashBoard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isActivePath = (path) => {
    return location.pathname.includes(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const navigationItems = [
    { name: 'Jobs', path: '/find-job', icon: '💼' },
    { name: 'Applications', path: '/applications', icon: '📝' },
    { name: 'Profile', path: '/user-profile', icon: '👤' },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          <span>JobBoard</span>
          <button 
            className="mobile-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '✕' : '☰'}
          </button>
        </div>
        
        <nav className="nav-items">
          {navigationItems.map((item) => (
            <div
              key={item.path}
              className={`nav-item ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={() => navigate(`/user-dashboard${item.path}`)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </div>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon"></span>
          <span>Logout</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h1 className="content-title">
              {navigationItems.find(item => isActivePath(item.path))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <span className="notification-dot"></span>
              🔔
            </button>
            <button 
              className="profile-btn" 
              onClick={() => navigate('/user-dashboard/user-profile')}
            >
              👤
            </button>
          </div>
        </div>
        
        <div className="content-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default JobSeekerDashBoard;