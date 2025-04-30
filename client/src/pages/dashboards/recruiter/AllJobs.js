import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';

const AllJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${APP_URL}/jobs/my-jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setJobs(response.data.jobs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${APP_URL}/jobs/my-jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchJobs(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete job');
    }
  };

  const formatRange = (rangeString) => {
    if (!rangeString) return '';
    const [min, max] = rangeString.split('-');
    return `${min}-${max}`;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="jobs-container">
      <div className="jobs-header">
        <h2>My Job Postings</h2>
        <Link to="/recruiter-dashboard/new-job" className="create-job-btn">
          Create New Job
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {jobs.length === 0 ? (
        <div className="no-jobs">
          <p>No jobs posted yet.</p>
        </div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <div key={job._id} className="job-card">
              <h3>{job.title}</h3>
              <p className="position">{job.position}</p>
              <div className="job-details">
                <p>
                  <strong>Experience:</strong> {formatRange(job.experience)} years
                </p>
                <p>
                  <strong>Salary:</strong> ₹{formatRange(job.salary)}
                </p>
                <p>
                  <strong>Location:</strong> {job.location}
                </p>
              </div>
              <div className="job-actions">
                <Link to={`/recruiter-dashboard/job-post-details/${job._id}`} className="view-btn">
                  View Details
                </Link>
                <Link 
                  to={`/recruiter-dashboard/jobs/${job._id}/applications`} 
                  className="applications-btn"
                >
                  View Applications
                </Link>
                <button onClick={() => handleDelete(job._id)} className="delete-btn">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllJobs;