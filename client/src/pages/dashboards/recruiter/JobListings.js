import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'active' ? theme.palette.success.light :
    status === 'closed' ? theme.palette.error.light :
    theme.palette.warning.light,
  color: theme.palette.common.white,
}));

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      setJobs(response.data.jobs);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.totalPages,
        totalEntries: response.data.pagination.total
      }));
    } catch (err) {
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

  const handlePageChange = (event, page) => {
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
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">My Job Postings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/recruiter-dashboard/create-new-job')}
        >
          Create New Job
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by title or location..."
            value={filters.search}
            onChange={handleFilterChange}
            name="search"
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange}
              name="status"
              label="Status"
            >
              <MenuItem value="">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Experience</InputLabel>
            <Select
              value={filters.experience}
              onChange={handleFilterChange}
              name="experience"
              label="Experience"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0-2">0-2 years</MenuItem>
              <MenuItem value="2-5">2-5 years</MenuItem>
              <MenuItem value="5+">5+ years</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job Title</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Salary Range</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map(job => (
              <StyledTableRow key={job._id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{`${job.experience?.min || 0}-${job.experience?.max || 0} years`}</TableCell>
                <TableCell>{`₹${job.salary}`}</TableCell>
                <TableCell>
                  <StatusChip
                    label={job.status}
                    status={job.status}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{job.applicationCount || 0}</Typography>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/recruiter-dashboard/jobs/${job._id}/applications`)}
                      title="View Applications"
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/recruiter-dashboard/jobs/${job._id}`)}
                      title="View Job Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(job._id)}
                      title="Delete Job"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {((pagination.currentPage - 1) * pagination.entriesPerPage) + 1}-
          {Math.min(pagination.currentPage * pagination.entriesPerPage, pagination.totalEntries)} of {pagination.totalEntries} entries
        </Typography>
        <Pagination
          count={pagination.totalPages}
          page={pagination.currentPage}
          onChange={handlePageChange}
          color="primary"
          size={isMobile ? "small" : "medium"}
        />
      </Box>
    </Box>
  );
};

export default JobListings; 