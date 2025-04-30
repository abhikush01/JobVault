import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { FaEnvelope, FaEye } from 'react-icons/fa';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './Applications.css';

// Add MessageModal component
const MessageModal = ({ isOpen, onClose, selectedApplicants, onSend }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(message);
    setMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Send Message to Applicants</h2>
        <p>{selectedApplicants.length} applicant(s) selected</p>
        <form onSubmit={handleSubmit}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            rows="4"
            required
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="send-btn">
              Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add ViewApplicationModal component
const ViewApplicationModal = ({ application, isOpen, onClose }) => {
  if (!isOpen || !application) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Application Details</h2>
        <div className="application-details">
          <div className="detail-group">
            <label>Applicant Name</label>
            <p>{application.applicant?.name}</p>
          </div>
          <div className="detail-group">
            <label>Email</label>
            <p>{application.applicant?.email}</p>
          </div>
          <div className="detail-group">
            <label>Phone</label>
            <p>{application.applicant?.phoneNumber}</p>
          </div>
          <div className="detail-group">
            <label>Cover Letter</label>
            <p className="cover-letter">{application.coverLetter}</p>
          </div>
          <div className="detail-group">
            <label>Status</label>
            <p className={`status ${application.status}`}>{application.status}</p>
          </div>
          <div className="detail-group">
            <label>Applied Date</label>
            <p>{new Date(application.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={onClose} className="close-btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Applications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    experience: ''
  });
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);

  useEffect(() => {
    fetchApplications();
  }, [jobId, filters]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${APP_URL}/jobseekers/job/${jobId}/applications`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params: filters
      });

      if (response.data && Array.isArray(response.data.applications)) {
        setApplications(response.data.applications);
      } else {
        setError('Invalid response format from server');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${APP_URL}/jobseekers/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      if (response.data.application) {
        setApplications(prev =>
          prev.map(app =>
            app._id === applicationId ? response.data.application : app
          )
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await Promise.all(
        selectedApplications.map(appId =>
          axios.patch(
            `${APP_URL}/jobseekers/applications/${appId}/status`,
            { status: newStatus },
            { headers: { 'Authorization': `Bearer ${token}` } }
          )
        )
      );
      fetchApplications();
      setSelectedApplications([]);
    } catch (err) {
      setError('Failed to update statuses');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSelectApplication = (applicationId) => {
    setSelectedApplications(prev =>
      prev.includes(applicationId)
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedApplications(prev =>
      prev.length === applications.length ? [] : applications.map(app => app._id)
    );
  };

  // Add sendMessage function
  const sendMessage = async (message) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${APP_URL}/applications/message`,
        {
          applicationIds: selectedApplications,
          message
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Show success message
      alert('Message sent successfully');
      setIsMessageModalOpen(false);
      setSelectedApplications([]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  // Add viewApplication function
  const viewApplication = (application) => {
    setSelectedApplication(application);
    setIsViewModalOpen(true);
  };

  if (loading) return <div className="loading">Loading applications...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="applications-page">
      <div className="header">
        <h1>Applications</h1>
      </div>

      <div className="filters-section">
        <div className="search-filters">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
        </div>

        {selectedApplications.length > 0 && (
          <div className="bulk-actions">
            <button
              className="message-btn"
              onClick={() => setIsMessageModalOpen(true)}
            >
              <FaEnvelope /> Message Selected ({selectedApplications.length})
            </button>
            <select
              onChange={(e) => handleBulkStatusChange(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Change Status</option>
              <option value="reviewing">Mark as Reviewing</option>
              <option value="shortlisted">Mark as Shortlisted</option>
              <option value="rejected">Mark as Rejected</option>
              <option value="hired">Mark as Hired</option>
            </select>
            <span>{selectedApplications.length} selected</span>
          </div>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedApplications.length === applications.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Applicant</th>
              <th>Email</th>
              <th>Applied Date</th>
              <th>Status</th>
              <th>Resume</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map(application => (
              <tr key={application._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedApplications.includes(application._id)}
                    onChange={() => toggleSelectApplication(application._id)}
                  />
                </td>
                <td>{application.applicant?.name || 'Unnamed'}</td>
                <td>{application.applicant?.email}</td>
                <td>{new Date(application.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={application.status || 'pending'}
                    onChange={(e) => handleStatusChange(application._id, e.target.value)}
                    className={`status-select ${application.status?.toLowerCase() || 'pending'}`}
                    disabled={updatingStatus === application._id}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </td>
                <td>
                  {application.resume && (
                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-resume-btn"
                    >
                      View Resume
                    </a>
                  )}
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => viewApplication(application)}
                      title="View Details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className="action-btn message-btn"
                      onClick={() => {
                        setSelectedApplications([application._id]);
                        setIsMessageModalOpen(true);
                      }}
                      title="Send Message"
                    >
                      <FaEnvelope />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        selectedApplicants={selectedApplications}
        onSend={sendMessage}
      />

      <ViewApplicationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        application={selectedApplication}
      />
    </div>
  );
};

export default Applications;