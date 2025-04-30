import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import axios from 'axios';
import { APP_URL } from '../../../lib/Constant';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

      await axios.post(`${APP_URL}/jobs`, formattedData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      navigate('/recruiter-dashboard/all-jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Create New Job Posting
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <StyledPaper>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior Software Engineer"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="e.g. Full Stack Developer"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Job description and requirements..."
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Experience (Years)"
                name="experience.min"
                type="number"
                value={formData.experience.min}
                onChange={handleChange}
                required
                placeholder="Min"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Experience (Years)"
                name="experience.max"
                type="number"
                value={formData.experience.max}
                onChange={handleChange}
                required
                placeholder="Max"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Salary (₹)"
                name="salary.min"
                type="number"
                value={formData.salary.min}
                onChange={handleChange}
                required
                placeholder="Min"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Maximum Salary (₹)"
                name="salary.max"
                type="number"
                value={formData.salary.max}
                onChange={handleChange}
                required
                placeholder="Max"
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g. Bangalore, India"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                required
                placeholder="List the key requirements for this position..."
                multiline
                rows={4}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={() => navigate('/recruiter-dashboard/all-jobs')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Job Post'}
            </Button>
          </Box>
        </form>
      </StyledPaper>
    </Box>
  );
};

export default NewJobPost;