import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Grid,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const JobPostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [job, setJob] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: "",
    experience: "",
    salary: "",
    location: "",
    requirements: "",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${APP_URL}/jobs/my-jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJob(response.data.job);
      setFormData({
        ...response.data.job,
        experience: response.data.job.experience,
        salary: response.data.job.salary,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch job details");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRangeChange = (field, type, value) => {
    const currentRange = formData[field] || "-";
    const [min, max] = currentRange.split("-");

    if (type === "min") {
      setFormData((prev) => ({
        ...prev,
        [field]: `${value}-${max}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: `${min}-${value}`,
      }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${APP_URL}/jobs/my-jobs/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setJob(response.data.job);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update job");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this job post?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${APP_URL}/jobs/my-jobs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      navigate("/recruiter-dashboard/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!job) {
    return <Alert severity="error">Job not found</Alert>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">
          {isEditing ? "Edit Job Post" : "Job Details"}
        </Typography>
        {!isEditing && (
          <Box>
            <IconButton
              color="primary"
              onClick={() => setIsEditing(true)}
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {isEditing ? (
        <StyledPaper>
          <form onSubmit={handleUpdate}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Job Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Experience (Years)"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Salary Range (₹)"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
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
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Requirements"
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
            <Box
              sx={{
                mt: 3,
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => {
                  setIsEditing(false);
                  setFormData(job);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </Box>
          </form>
        </StyledPaper>
      ) : (
        <StyledPaper>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                {job.title}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {job.position}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {job.description}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Requirements
              </Typography>
              <Typography variant="body1" paragraph>
                {job.requirements}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Experience
              </Typography>
              <Typography variant="body1">{job.experience} years</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Salary Range
              </Typography>
              <Typography variant="body1">₹{job.salary}</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Location
              </Typography>
              <Typography variant="body1">{job.location}</Typography>
            </Grid>
          </Grid>
        </StyledPaper>
      )}

      <Outlet />
    </Box>
  );
};

export default JobPostDetails;
