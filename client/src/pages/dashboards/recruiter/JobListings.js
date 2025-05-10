import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
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
  useTheme,
  useMediaQuery,
  Popover,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === "active"
      ? theme.palette.success.light
      : status === "closed"
      ? theme.palette.error.light
      : theme.palette.warning.light,
  color: theme.palette.common.white,
}));

const JobListings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    experience: "",
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${APP_URL}/jobs/my-jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(response.data.jobs || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch jobs");
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${APP_URL}/jobs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobs(jobs.filter((job) => job._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete job");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (
      !window.confirm(
        `Are you sure you want to ${
          newStatus === "closed" ? "close" : "reopen"
        } this job posting?`
      )
    )
      return;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${APP_URL}/jobs/my-jobs/${id}`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update the job status in the local state
      setJobs(
        jobs.map((job) =>
          job._id === id ? { ...job, status: newStatus } : job
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          `Failed to ${newStatus === "closed" ? "close" : "reopen"} job`
      );
    }
  };

  const handleStatusClick = (event, jobId) => {
    setAnchorEl(event.currentTarget);
    setSelectedJobId(jobId);
  };

  const handleStatusClose = () => {
    setAnchorEl(null);
    setSelectedJobId(null);
  };

  const handleStatusSelect = async (newStatus) => {
    if (
      window.confirm(
        `Are you sure you want to ${
          newStatus === "closed" ? "close" : "reopen"
        } this job posting?`
      )
    ) {
      await handleStatusChange(selectedJobId, newStatus);
    }
    handleStatusClose();
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Job Postings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/recruiter-dashboard/create-new-job")}
        >
          Create New Job
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Search jobs..."
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
            {jobs.map((job) => (
              <StyledTableRow key={job._id}>
                <TableCell>{job.title}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell>{`${job.experience || "0"} years`}</TableCell>
                <TableCell>{`₹${job.salary}`}</TableCell>
                <TableCell>
                  <FormControl size="small">
                    <Select
                      value={job.status}
                      onChange={(e) =>
                        handleStatusChange(job._id, e.target.value)
                      }
                      size="small"
                      sx={{
                        minWidth: 100,
                        backgroundColor:
                          job.status === "active"
                            ? "success.light"
                            : "error.light",
                        color: "white",
                        "& .MuiSelect-icon": {
                          color: "white",
                        },
                        "&:hover": {
                          backgroundColor:
                            job.status === "active"
                              ? "success.main"
                              : "error.main",
                        },
                      }}
                    >
                      <MenuItem value="active" sx={{ color: "success.main" }}>
                        Active
                      </MenuItem>
                      <MenuItem value="closed" sx={{ color: "error.main" }}>
                        Closed
                      </MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography>{job.applicationCount || 0}</Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(
                          `/recruiter-dashboard/jobs/${job._id}/applications`
                        )
                      }
                      title="View Applications"
                    >
                      <PeopleIcon />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigate(`/recruiter-dashboard/jobs/${job._id}`)
                      }
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(job._id)}
                      title="Delete"
                      color="error"
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

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleStatusClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <List sx={{ width: 200 }}>
          <ListItem
            button
            onClick={() => handleStatusSelect("active")}
            sx={{
              bgcolor: (theme) => theme.palette.success.light,
              color: "white",
              "&:hover": {
                bgcolor: (theme) => theme.palette.success.main,
              },
            }}
          >
            <ListItemText primary="Active" />
          </ListItem>
          <ListItem
            button
            onClick={() => handleStatusSelect("closed")}
            sx={{
              bgcolor: (theme) => theme.palette.error.light,
              color: "white",
              "&:hover": {
                bgcolor: (theme) => theme.palette.error.main,
              },
            }}
          >
            <ListItemText primary="Closed" />
          </ListItem>
        </List>
      </Popover>
    </Box>
  );
};

export default JobListings;
