import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Outlet } from 'react-router';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './RecruiterDashboard.css';

const JobPostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    experience: '',
    salary: '',
    location: '',
    requirements: ''
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${APP_URL}/jobs/my-jobs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJob(response.data.job);
      
      const jobData = response.data.job;
      setFormData({
        ...jobData,
        experience: jobData.experience,
        salary: jobData.salary
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRangeChange = (field, type, value) => {
    const currentRange = formData[field] || '-';
    const [min, max] = currentRange.split('-');
    
    if (type === 'min') {
      setFormData(prev => ({
        ...prev,
        [field]: `${value}-${max}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: `${min}-${value}`
      }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${APP_URL}/jobs/my-jobs/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJob(response.data.job);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${APP_URL}/jobs/my-jobs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/recruiter-dashboard/jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!job) {
    return <div className="error-message">Job not found</div>;
  }

  return (
    <div className="job-details-container">
      <div className="job-details-header">
        <h2>{isEditing ? 'Edit Job Post' : 'Job Details'}</h2>
        <div className="header-actions">
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit
              </button>
              <button onClick={handleDelete} className="delete-btn">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isEditing ? (
        <form onSubmit={handleUpdate} className="job-form">
          <div className="form-group">
            <label>Job Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Position</label>
            <input
              type="text"
              name="position"
              value={formData.position}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="6"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Experience (Years)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={formData.experience?.split('-')[0] || ''}
                  onChange={(e) => handleRangeChange('experience', 'min', e.target.value)}
                  required
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={formData.experience?.split('-')[1] || ''}
                  onChange={(e) => handleRangeChange('experience', 'max', e.target.value)}
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Salary Range (₹)</label>
              <div className="range-inputs">
                <input
                  type="number"
                  value={formData.salary?.split('-')[0] || ''}
                  onChange={(e) => handleRangeChange('salary', 'min', e.target.value)}
                  required
                  min="0"
                />
                <span>to</span>
                <input
                  type="number"
                  value={formData.salary?.split('-')[1] || ''}
                  onChange={(e) => handleRangeChange('salary', 'max', e.target.value)}
                  required
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData(job);
              }}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="job-details-content">
          <div className="detail-section">
            <h3>{job.title}</h3>
            <p className="position">{job.position}</p>
          </div>

          <div className="detail-section">
            <h4>Description</h4>
            <p className="description">{job.description}</p>
          </div>

          <div className="detail-section">
            <h4>Requirements</h4>
            <div className="requirements">
              <p>
                <strong>Experience:</strong> {job.experience} years
              </p>
              <p>
                <strong>Salary Range:</strong> ₹{job.salary}
              </p>
              <p>
                <strong>Location:</strong> {job.location}
              </p>
            </div>
          </div>
        </div>
      )}

      <Outlet />
    </div>
  );
};

export default JobPostDetails;