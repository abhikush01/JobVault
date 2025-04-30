import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import './JobList.css';
import { APP_URL } from '../../../lib/Constant';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${APP_URL}/jobseekers/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Ensure we're setting an array of jobs
        setJobs(Array.isArray(response.data) ? response.data : 
               (response.data.jobs || []));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.response?.data?.message || 'Failed to load jobs');
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="job-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-list-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      <div className="job-list-header">
        <h2 className="job-list-title">Available Jobs</h2>
        <div className="job-filters">
          <input 
            type="text" 
            placeholder="Search jobs..." 
            className="search-input"
          />
          <select className="filter-select">
            <option value="">All Categories</option>
            <option value="fulltime">Full Time</option>
            <option value="parttime">Part Time</option>
            <option value="contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="job-grid">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job._id} className="job-card">
              <div className="company-logo">
                {job.company?.charAt(0) || 'C'}
              </div>
              <div className="job-content">
                <h3 className="job-title">{job.title}</h3>
                <div className="job-company">{job.company}</div>
                <div className="job-details">
                  <div className="job-detail">
                    <span className="detail-icon">📍</span>
                    {job.location || 'Remote'}
                  </div>
                  <div className="job-detail">
                    <span className="detail-icon">💰</span>
                    {job.salary || 'Competitive'}
                  </div>
                  <div className="job-detail">
                    <span className="detail-icon">⏰</span>
                    {job.type || 'Full Time'}
                  </div>
                </div>
                <div className="job-tags">
                  {job.skills?.slice(0, 3).map((skill, index) => (
                    <span key={index} className="job-tag">
                      {skill}
                    </span>
                  ))}
                </div>
                <button 
                  className="view-details-btn"
                  onClick={() => navigate(`/user-dashboard/job-details/${job._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-jobs">
            <div className="no-jobs-icon">🔍</div>
            <h3>No Jobs Found</h3>
            <p>We couldn't find any jobs matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobList;