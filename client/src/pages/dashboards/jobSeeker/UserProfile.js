import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    location: '',
    skills: [],
    experience: 0,
    education: {
      degree: '',
      field: '',
      institution: '',
      year: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${APP_URL}/jobseekers/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const userData = response.data.user;
      
      const profileData = {
        name: userData.name || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        location: userData.location || '',
        skills: userData.skills || [],
        experience: userData.experience || 0,
        education: {
          degree: userData.education?.degree || '',
          field: userData.education?.field || '',
          institution: userData.education?.institution || '',
          year: userData.education?.year || ''
        }
      };
      
      setProfile(profileData);
      setEditedProfile(profileData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Failed to load profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setEditedProfile(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setEditedProfile(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setEditedProfile(prev => ({ ...prev, skills }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${APP_URL}/api/jobs/profile`, editedProfile, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <span>⚠️</span>
          <p>{error}</p>
          <button onClick={fetchProfile}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-title">
          <h2>My Profile</h2>
          <button 
            className="edit-button"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editedProfile.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={editedProfile.email}
                  disabled
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={editedProfile.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editedProfile.location}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Professional Information</h3>
            <div className="form-grid">
              <div className="input-group full-width">
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={editedProfile.skills.join(', ')}
                  onChange={handleSkillsChange}
                />
              </div>
              <div className="input-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={editedProfile.experience}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Education</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Degree</label>
                <input
                  type="text"
                  name="education.degree"
                  value={editedProfile.education.degree}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  name="education.field"
                  value={editedProfile.education.field}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-group">
                <label>Institution</label>
                <input
                  type="text"
                  name="education.institution"
                  value={editedProfile.education.institution}
                  onChange={handleInputChange}
                />
              </div>
              <div className="input-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  name="education.year"
                  value={editedProfile.education.year}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
          </div>
        </form>
      ) : (
        <div className="profile-content">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Full Name</span>
                <span className="info-value">{profile.name || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{profile.email || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{profile.phoneNumber || 'Not specified'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">{profile.location || 'Not specified'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Professional Information</h3>
            <div className="skills-section">
              <h4>Skills</h4>
              <div className="skills-list">
                {profile.skills && profile.skills.length > 0 ? (
                  profile.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))
                ) : (
                  <span className="no-skills">No skills listed</span>
                )}
              </div>
            </div>
            <div className="info-item">
              <span className="info-label">Years of Experience</span>
              <span className="info-value">{profile.experience || 0}</span>
            </div>
          </div>

          <div className="profile-section">
            <h3>Education</h3>
            <div className="education-card">
              <h4>{profile.education?.degree || 'Degree not specified'}</h4>
              <p>{profile.education?.field || 'Field not specified'}</p>
              <p>{profile.education?.institution || 'Institution not specified'}</p>
              <p>Graduated: {profile.education?.year || 'Year not specified'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;