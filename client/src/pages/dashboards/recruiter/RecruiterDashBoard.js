import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { 
  FaHome, 
  FaPlusCircle, 
  FaBriefcase, 
  FaUser, 
  FaSignOutAlt,
  FaBars,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './RecruiterDashboard.css';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [recruiter, setRecruiter] = useState(null);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${APP_URL}/recruiter/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setRecruiter(response.data);
      } catch (error) {
        console.error('Error fetching recruiter data:', error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchRecruiterData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/recruiter-auth');
  };

  const isActivePath = (path) => {
    if (path === 'dashboard') {
      // Exact match for dashboard
      return location.pathname === '/recruiter-dashboard';
    }
    // For other paths, keep using includes
    return location.pathname.includes(path);
  };

  return (
    <>
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <FaBars />
      </button>

      <div className="dashboard">
        <aside className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
          <div className="logo">Aspire Match</div>
          
          <nav className="menu">
            <button 
              className={`menu-item ${isActivePath('dashboard') ? "not-active" : ''}`}
              onClick={() => {
                navigate('/recruiter-dashboard');
                setIsMenuOpen(false);
              }}
            >
              <FaHome />
              Dashboard
            </button>

            <button 
              className={`menu-item ${isActivePath('create-new-job') ? 'active' : ''}`}
              onClick={() => {
                navigate('/recruiter-dashboard/create-new-job');
                setIsMenuOpen(false);
              }}
            >
              <FaPlusCircle />
              Create Job
            </button>

            <button 
              className={`menu-item ${isActivePath('all-jobs') ? 'active' : ''}`}
              onClick={() => {
                navigate('/recruiter-dashboard/all-jobs');
                setIsMenuOpen(false);
              }}
            >
              <FaBriefcase />
              View Jobs
            </button>

            <button 
              className={`menu-item ${isActivePath('profile') ? 'active' : ''}`}
              onClick={() => {
                navigate('/recruiter-dashboard/profile');
                setIsMenuOpen(false);
              }}
            >
              <FaUser />
              View Profile
            </button>
          </nav>

          <div className="logout">
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="dashboard-header">
            <h1 className="welcome-message">
              Welcome back, {recruiter?.name || 'Recruiter'}! 👋
            </h1>
            <p className="company-info">
              {recruiter?.companyName && `${recruiter.companyName}`}
            </p>
          </div>
          <div className="dashboard-content">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
};

export default RecruiterDashboard;