import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import axios from 'axios';
import './JobDetails.css';
import { APP_URL } from '../../../lib/Constant';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const fetchJobAndApplicationStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const [jobResponse, applicationResponse] = await Promise.all([
          axios.get(`${APP_URL}/jobseekers/jobs/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${APP_URL}/jobseekers/jobs/${id}/check-application`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setJob(jobResponse.data.job);
        setHasApplied(applicationResponse.data.hasApplied);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError('Failed to load job details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplicationStatus();
  }, [id]);

  const handleApply = async () => {
    if (hasApplied) {
      return; // Prevent multiple applications
    }

    setApplying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${APP_URL}/jobseekers/jobs/${id}/apply`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      
      console.log('Application response:', response.data); // Debug log
      setHasApplied(true);
      alert('Application submitted successfully!');
      navigate('/user-dashboard/applications');
    } catch (error) {
      console.error('Error applying for job:', error.response || error);
      alert(
        error.response?.data?.message || 
        'Failed to submit application. Please try again.'
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!job) return <div className="error">Job not found</div>;

  return (
    <div className="job-details-container">
      <div className="job-info-card">
        <h1 className="job-title">{job.title}</h1>
        <div className="job-company">{job.company}</div>
        
        <div className="job-section">
          <div className="job-section-label">Description</div>
          <div className="job-section-content">{job.description}</div>
        </div>

        <div className="job-section">
          <div className="job-section-label">Requirements</div>
          <div className="job-section-content">{job.requirements}</div>
        </div>

        <div className="job-section">
          <div className="job-section-label">Location</div>
          <div className="job-section-content">{job.location}</div>
        </div>

        <div className="job-section">
          <div className="job-section-label">Salary</div>
          <div className="job-section-content">{job.salary}</div>
        </div>

        <div className="apply-section">
          <button 
            className={`apply-btn ${hasApplied ? 'applied' : ''}`}
            onClick={handleApply}
            disabled={applying || hasApplied}
          >
            {applying ? 'Applying...' : hasApplied ? 'Applied' : 'Apply Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;