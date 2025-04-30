import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
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
  backgroundColor: status === 'pending' ? theme.palette.warning.light :
    status === 'accepted' ? theme.palette.success.light :
    status === 'rejected' ? theme.palette.error.light :
    theme.palette.info.light,
  color: theme.palette.common.white,
}));

const Applications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    experience: ''
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchApplications();
  }, [jobId, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      console.log('Fetching applications for job:', jobId); // Debug log
      const response = await axios.get(`${APP_URL}/jobs/${jobId}/applications`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response data:', response.data); // Debug log
      
      if (response.data && response.data.applications) {
        console.log('Applications found:', response.data.applications.length); // Debug log
        setApplications(response.data.applications);
      } else if (response.data && response.data.count === 0) {
        console.log('No applications found for this job'); // Debug log
        setApplications([]);
      } else {
        console.log('Unexpected response format:', response.data); // Debug log
        setApplications([]);
      }
      setError('');
    } catch (err) {
      console.error('Error fetching applications:', err);
      console.error('Error response:', err.response); // Debug log
      console.error('Error message:', err.message); // Debug log
      setError(err.response?.data?.message || 'Failed to fetch applications. Please try again.');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${APP_URL}/jobs/${jobId}/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleCommentSubmit = async () => {
    if (!selectedApplication || !comment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${APP_URL}/jobs/${jobId}/applications/${selectedApplication._id}/comment`,
        { comment: comment.trim() },
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setComment('');
      setCommentDialogOpen(false);
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send comment');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
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
      <Typography variant="h4" gutterBottom>
        Job Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search applicants..."
            value={filters.search}
            onChange={handleFilterChange}
            name="search"
            InputProps={{
              startAdornment: <SearchIcon />,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange}
              name="status"
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="accepted">Accepted</MenuItem>
              <MenuItem value="rejected">Rejected</MenuItem>
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
              <TableCell>Applicant</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Applied Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((application) => (
                <StyledTableRow key={application._id}>
                  <TableCell>{application.applicant?.name || 'N/A'}</TableCell>
                  <TableCell>{application.applicant?.email || 'N/A'}</TableCell>
                  <TableCell>{application.applicant?.experience || 'N/A'} years</TableCell>
                  <TableCell>
                    <StatusChip
                      label={application.status}
                      status={application.status}
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedApplication(application);
                          setCommentDialogOpen(true);
                        }}
                      >
                        <CommentIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => handleStatusChange(application._id, 'accepted')}
                        disabled={updatingStatus === application._id}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleStatusChange(application._id, 'rejected')}
                        disabled={updatingStatus === application._id}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
        <DialogTitle>Send Comment to Applicant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCommentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleCommentSubmit}
            variant="contained"
            startIcon={<SendIcon />}
            disabled={!comment.trim()}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;