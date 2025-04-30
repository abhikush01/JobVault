import React, { useState, useEffect } from 'react';
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './RecruiterProfile.css';

const RecruiterProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    companyName: '',
    companyWebsite: '',
    location: '',
    about: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${APP_URL}/recruiters/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${APP_URL}/api/recruiters/profile`,
        profile,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="recruiter-profile">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <button 
          className={`edit-btn ${isEditing ? 'save-mode' : ''}`}
          onClick={() => !isEditing ? setIsEditing(true) : null}
        >
          {isEditing ? 'Editing...' : 'Edit Profile'}
        </button>
      </div>

      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label>
              <FaUser /> Full Name
            </label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaEnvelope /> Email
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label>
              <FaPhone /> Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              value={profile.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Company Information</h2>
          <div className="form-group">
            <label>
              <FaBuilding /> Company Name
            </label>
            <input
              type="text"
              name="companyName"
              value={profile.companyName}
              onChange={handleInputChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <FaBuilding /> Company Website
            </label>
            <input
              type="url"
              name="companyWebsite"
              value={profile.companyWebsite}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="https://"
            />
          </div>

          <div className="form-group">
            <label>
              <FaMapMarkerAlt /> Location
            </label>
            <input
              type="text"
              name="location"
              value={profile.location}
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className="form-group">
            <label>About Company</label>
            <textarea
              name="about"
              value={profile.about}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows="4"
            />
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default RecruiterProfile;