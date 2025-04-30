import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { FaPlus, FaEye, FaEdit, FaTrash, FaUsers } from 'react-icons/fa';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import './JobListings.css';

const JobListings = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    location: '',
    experience: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalEntries: 0,
    entriesPerPage: 10
  });

  useEffect(() => {
    fetchJobs();
  }, [filters, pagination.currentPage]);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${APP_URL}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: pagination.currentPage,
          limit: pagination.entriesPerPage,
          ...filters
        }
      });

      console.log('Jobs response:', response.data); // Debug log

      setJobs(response.data.jobs);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalEntries: response.data.pagination.total
      }));
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.response?.data?.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDelete = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${APP_URL}/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchJobs();
      } catch (err) {
        setError('Failed to delete job');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="jobs-page">
      <div className="header">
        <h1>My Job Postings</h1>
        <button 
          className="create-job-btn"
          onClick={() => navigate('/recruiter-dashboard/create-new-job')}
        >
          <FaPlus /> Create New Job
        </button>
      </div>

      <div className="filters-section">
        <div className="search-filters">
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search by title or location..."
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
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          {/* Add other filter groups similarly */}
        </div>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Salary Range</th>
              <th>Status</th>
              <th>Applications</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job._id}>
                <td>{job.title}</td>
                <td>{job.location}</td>
                <td>{`${job.experience?.min || 0}-${job.experience?.max || 0} years`}</td>
                <td>{`₹${job.salary}`}</td>
                <td>
                  <span className={`status ${job.status.toLowerCase()}`}>
                    {job.status}
                  </span>
                </td>
                <td>
                  <div className="application-cell">
                    <span>{job.applicationCount || 0}</span>
                    <button 
                      className="action-btn applications-btn"
                      onClick={() => navigate(`/recruiter-dashboard/jobs/${job._id}/applications`)}
                      title="View Applications"
                    >
                      <FaUsers />
                    </button>
                  </div>
                </td>
                <td>
                  <div className="actions">
                    <button 
                      className="action-btn view-btn"
                      onClick={() => navigate(`/recruiter-dashboard/jobs/${job._id}`)}
                      title="View Job Details"
                    >
                      <FaEye />
                    </button>
                    <button 
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(job._id)}
                      title="Delete Job"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <div className="page-info">
            Showing {((pagination.currentPage - 1) * pagination.entriesPerPage) + 1}-
            {Math.min(pagination.currentPage * pagination.entriesPerPage, pagination.totalEntries)} of {pagination.totalEntries} entries
          </div>
          <div className="page-buttons">
            <button 
              className="page-btn"
              disabled={pagination.currentPage === 1}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Previous
            </button>
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                className={`page-btn ${pagination.currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button 
              className="page-btn"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobListings; 