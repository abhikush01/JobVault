import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './RecruiterDashboard.css';

const NewJobPost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    position: '',
    experience: {
      min: '',
      max: ''
    },
    salary: {
      min: '',
      max: ''
    },
    location: '',
    requirements: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formattedData = {
        ...formData,
        salary: `${formData.salary.min}-${formData.salary.max}`,
        experience: `${formData.experience.min}-${formData.experience.max}`,
        requirements: formData.requirements.trim()
      };

      console.log('Sending data:', formattedData);

      await axios.post(`${APP_URL}/jobs`, formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/recruiter-dashboard/jobs');
    } catch (err) {
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="job-post-container">
      <h2>Create New Job Posting</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="job-form">
        <div className="form-group">
          <label>Job Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. Senior Software Engineer"
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
            placeholder="e.g. Full Stack Developer"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Job description and requirements..."
            rows="6"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Experience (Years)</label>
            <div className="range-inputs">
              <input
                type="number"
                name="experience.min"
                value={formData.experience.min}
                onChange={handleChange}
                required
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="experience.max"
                value={formData.experience.max}
                onChange={handleChange}
                required
                placeholder="Max"
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
                name="salary.min"
                value={formData.salary.min}
                onChange={handleChange}
                required
                placeholder="Min"
                min="0"
              />
              <span>to</span>
              <input
                type="number"
                name="salary.max"
                value={formData.salary.max}
                onChange={handleChange}
                required
                placeholder="Max"
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
            placeholder="e.g. Bangalore, India"
          />
        </div>

        <div className="form-group">
          <label>Requirements</label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            placeholder="List the key requirements for this position..."
            rows="4"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Job Post'}
        </button>
      </form>
    </div>
  );
};

export default NewJobPost;