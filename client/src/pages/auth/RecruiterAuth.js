import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import './Auth.css';
import { APP_URL } from '../../lib/Constant';

const RecruiterAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
    name: '',
    phoneNumber: '',
    designation: '',
    companyName: '',
    companyWebsite: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token with backend
          const response = await axios.get(`${APP_URL}/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`  // Make sure to add 'Bearer ' prefix
            }
          });
          
          // If token is valid and user is a recruiter
          if (response.data.valid && response.data.role === 'recruiter') {
            navigate('/recruiter-dashboard');
            return;
          } else {
            // If token is valid but not a recruiter, remove it
            localStorage.removeItem('token');
          }
        } catch (err) {
          // If token is invalid, remove it
          console.error('Auth check error:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleInitialSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post(`${APP_URL}/auth/recruiter/signup`, {
        email: formData.email,
        password: formData.password
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${APP_URL}/auth/recruiter/verify`, formData);
      localStorage.setItem('token', response.data.token);
      navigate('/recruiter-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${APP_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: 'recruiter'
      });
      localStorage.setItem('token', response.data.token);
      navigate('/recruiter-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.email) {
    return (
      <div className="auth-container">
        <div className="container">
          <div className="auth-box">
            <h2>Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="container">
        <div className="left-section">
          <div className="logo">Aspire Match</div>
          <h1 className="headline">Build your <span>dream team</span></h1>
          <p className="subheadline">1-stop solution to hire best talent for your business.</p>
          
          <div className="trusted-section">
            <p className="trusted-text">Trusted by 10+ global brands</p>
            <div className="brand-logos">
              <img src="/company1.png" alt="Company 1" />
              <img src="/company2.png" alt="Company 2" />
              <img src="/company3.png" alt="Company 3" />
              <img src="/company4.png" alt="Company 4" />
            </div>
          </div>
        </div>

        <div className="auth-box">
          <h2>{step === 3 ? 'Welcome Back!' : 'Create Account'}</h2>
          
          {error && <div className="error-message">{error}</div>}

          {step === 1 && (
            <form onSubmit={handleInitialSignup}>
              <div className="form-group">
                <label htmlFor="email">Work Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your work email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Sign Up'}
              </button>
              <div className="signup-section">
                <p>
                  Already have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setStep(3); }}>
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyAndComplete}>
              <div className="form-group">
                <label htmlFor="otp">Enter OTP</label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="designation">Designation</label>
                <input
                  type="text"
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyName">Company Name</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="companyWebsite">Company Website</label>
                <input
                  type="text"
                  id="companyWebsite"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Complete Profile'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Work Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Enter your work email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? 'Loading...' : 'Sign in'}
              </button>
              <div className="forgot-password">
                <a href="#">Forgot Password?</a>
              </div>
              <div className="signup-section">
                <p>
                  Don't have an account?{' '}
                  <a href="#" onClick={(e) => { e.preventDefault(); setStep(1); }}>
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruiterAuth;