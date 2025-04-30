import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './UserApplications.css';

const ApplicationModal = ({ application, onClose }) => {
  if (!application) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>&times;</button>
        
        <div className="modal-header">
          <h2>{application.job?.title}</h2>
          <div className="company-name">{application.job?.company}</div>
        </div>

        <div className="modal-body">
          <div className="status-section">
            <h3>Application Status</h3>
            <div className={`status-badge ${application.status.toLowerCase()}`}>
              {application.status}
            </div>
          </div>

          <div className="details-section">
            <div className="detail-row">
              <span className="label">Applied Date:</span>
              <span>{new Date(application.appliedDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <span className="label">Location:</span>
              <span>{application.job?.location || 'Remote'}</span>
            </div>
            <div className="detail-row">
              <span className="label">Salary:</span>
              <span>{application.job?.salary || 'Not specified'}</span>
            </div>
          </div>

          {application.feedback && (
            <div className="feedback-section">
              <h3>Recruiter Feedback</h3>
              <div className="feedback-content">
                {application.feedback}
              </div>
            </div>
          )}

          {application.status === 'Accepted' && application.nextSteps && (
            <div className="next-steps-section">
              <h3>Next Steps</h3>
              <div className="next-steps-content">
                {application.nextSteps}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UserApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${APP_URL}/jobseekers/applications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const applicationsData = response.data.applications || [];
        console.log('Applications data:', applicationsData);
        setApplications(applicationsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching applications:', error);
        setError(error.response?.data?.message || 'Failed to load applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(app => 
    statusFilter === 'all' || app.status.toLowerCase() === statusFilter
  );

  const handleCardClick = (application) => {
    setSelectedApplication(application);
  };

  if (loading) {
    return (
      <div className="applications-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading applications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="applications-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h2>My Applications</h2>
        <div className="filter-section">
          <select 
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="applications-grid">
          {filteredApplications.map((application) => (
            <div 
              key={application._id} 
              className="application-card"
              onClick={() => handleCardClick(application)}
            >
              <div className="company-logo">
                {application.job?.company?.charAt(0) || 'C'}
              </div>
              <div className="application-content">
                <h3 className="job-title">{application.job?.title}</h3>
                <div className="company-name">{application.job?.company}</div>
                
                <div className="application-details">
                  <div className="detail-item">
                    <span className="detail-icon">📅</span>
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </div>
                  <div className="detail-item">
                    <span className="detail-icon">📍</span>
                    {application.job?.location || 'Remote'}
                  </div>
                </div>

                <div className={`application-status ${application.status.toLowerCase()}`}>
                  {application.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-applications">
          <div className="no-data-icon">📝</div>
          <h3>No Applications Found</h3>
          <p>
            {statusFilter === 'all' 
              ? "You haven't applied to any jobs yet. Start exploring opportunities!"
              : `No applications with ${statusFilter} status.`}
          </p>
        </div>
      )}

      {selectedApplication && (
        <ApplicationModal 
          application={selectedApplication} 
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </div>
  );
};

export default UserApplications;