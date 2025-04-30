import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import './Auth.css';
import { APP_URL } from '../../lib/Constant';

const UserAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    name: '',
    phoneNumber: '',
    skills: '',
    experience: '',
    education: {
      degree: '',
      field: '',
      institution: '',
      year: ''
    },
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get(`${APP_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data.valid && response.data.role === 'user') {
            navigate('/user-dashboard');
          } else {
            localStorage.removeItem('token');
          }
        } catch (err) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [navigate]);

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

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${APP_URL}/auth/user/signup`, {
        email: formData.email
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const validateEducation = () => {
    const { degree, field, institution, year } = formData.education;
    if (degree || field || institution || year) {
      if (!degree || !field || !institution || !year) {
        setError('Please complete all education fields');
        return false;
      }
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        setError('Please enter a valid graduation year');
        return false;
      }
    }
    return true;
  };

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateEducation()) {
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()).filter(Boolean) : []
      };

      const response = await axios.post(
        `${APP_URL}/auth/user/verify-and-complete`, 
        requestData
      );
      
      localStorage.setItem('token', response.data.token);
      navigate('/user-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${APP_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: 'user'
      });
      localStorage.setItem('token', response.data.token);
      navigate('/user-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return <div className="loading-spinner"></div>;
  }

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <h2>{step === 3 ? 'Welcome Back!' : 'Join Our Community'}</h2>
        {step === 1 && <p>Start your journey with us. Create an account to explore job opportunities.</p>}
        {step === 2 && <p>Tell us more about yourself to help you find the perfect job match.</p>}
        {step === 3 && <p>Sign in to access your dashboard and continue your job search.</p>}
        
        {step !== 3 && (
          <div className="step-indicator">
            <div className={`step-dot ${step >= 1 ? 'active' : ''}`}></div>
            <div className={`step-dot ${step >= 2 ? 'active' : ''}`}></div>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {step === 1 && (
          <form onSubmit={handleSignup}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Get Started'}
            </button>
            <div className="auth-toggle">
              Already have an account?{' '}
              <span onClick={() => setStep(3)} className="link">
                Sign In
              </span>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndComplete}>
            <div className="input-group">
              <label>OTP</label>
              <input
                type="text"
                name="otp"
                value={formData.otp}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Create Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Skills (comma separated)</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label>Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>

            <div className="education-section">
              <h3>Education Details</h3>
              <div className="input-group">
                <label>Degree</label>
                <input
                  type="text"
                  name="education.degree"
                  value={formData.education.degree}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Field of Study</label>
                <input
                  type="text"
                  name="education.field"
                  value={formData.education.field}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Institution</label>
                <input
                  type="text"
                  name="education.institution"
                  value={formData.education.institution}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label>Graduation Year</label>
                <input
                  type="number"
                  name="education.year"
                  value={formData.education.year}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className="auth-toggle">
              Don't have an account?{' '}
              <span onClick={() => setStep(1)} className="link">
                Sign Up
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserAuth;