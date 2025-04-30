import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn,
  AttachMoney,
  AccessTime,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const CompanyAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${APP_URL}/jobseekers/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        setJobs(Array.isArray(response.data) ? response.data : 
               (response.data.jobs || []));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError(error.response?.data?.message || 'Failed to load jobs');
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filter || job.type?.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Available Jobs
      </Typography>

      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          fullWidth
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          fullWidth
          sx={{ minWidth: { sm: 200 } }}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          label="Job Type"
        >
          <MenuItem value="">All Types</MenuItem>
          <MenuItem value="fulltime">Full Time</MenuItem>
          <MenuItem value="parttime">Part Time</MenuItem>
          <MenuItem value="contract">Contract</MenuItem>
          <MenuItem value="internship">Internship</MenuItem>
        </TextField>
      </Box>

      {filteredJobs.length > 0 ? (
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job._id}>
              <StyledCard>
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <CompanyAvatar>
                      {job.company?.charAt(0) || 'C'}
                    </CompanyAvatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" noWrap>
                        {job.title}
                      </Typography>
                      <Typography variant="subtitle2" color="text.secondary">
                        {job.company}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <LocationOn fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{job.location || 'Remote'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{job.salary || 'Competitive'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AccessTime fontSize="small" sx={{ mr: 1 }} />
                      <Typography variant="body2">{job.type || 'Full Time'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2, flexGrow: 1 }}>
                    {job.skills?.slice(0, 3).map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate(`/user-dashboard/job-details/${job._id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 2,
            backgroundColor: 'background.paper',
            borderRadius: 1
          }}
        >
          <Typography variant="h6" gutterBottom>
            No Jobs Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We couldn't find any jobs matching your criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default JobList;