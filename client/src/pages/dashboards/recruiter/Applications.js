import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Comment as CommentIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Download as DownloadIcon,
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
    status === "pending"
      ? theme.palette.warning.light
      : status === "reviewing"
      ? theme.palette.info.light
      : status === "shortlisted"
      ? theme.palette.success.light
      : status === "rejected"
      ? theme.palette.error.light
      : status === "hired"
      ? theme.palette.success.dark
      : theme.palette.grey[500],
  color: theme.palette.common.white,
}));

const Applications = () => {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    experience: "",
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchApplications();
  }, [jobId, filters]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      console.log("Fetching applications for job:", jobId); // Debug log
      const response = await axios.get(
        `${APP_URL}/applications/job/${jobId}/applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response data:", response.data); // Debug log

      if (response.data && response.data.applications) {
        console.log("Applications found:", response.data.applications.length); // Debug log
        setApplications(response.data.applications);
      } else if (response.data && response.data.count === 0) {
        console.log("No applications found for this job"); // Debug log
        setApplications([]);
      } else {
        console.log("Unexpected response format:", response.data); // Debug log
        setApplications([]);
      }
      setError("");
    } catch (err) {
      console.error("Error fetching applications:", err);
      console.error("Error response:", err.response); // Debug log
      console.error("Error message:", err.message); // Debug log
      setError(
        err.response?.data?.message ||
          "Failed to fetch applications. Please try again."
      );
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${APP_URL}/applications/application/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleViewFeedback = async (application) => {
    setSelectedApplication(application);
    setCommentDialogOpen(true);
    setLoadingFeedback(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${APP_URL}/applications/${application._id}/feedback`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedbackMessages(response.data.feedbacks || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to fetch feedback messages");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!selectedApplication || !comment.trim()) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${APP_URL}/applications/feedback`,
        {
          message: comment.trim(),
          applicationId: selectedApplication._id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh feedback messages after sending new one
      const response = await axios.get(
        `${APP_URL}/applications/${selectedApplication._id}/feedback`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedbackMessages(response.data.feedbacks || []);
      setComment("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send feedback");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
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
              <TableCell>Resume</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.length > 0 ? (
              applications.map((application) => (
                <StyledTableRow key={application._id}>
                  <TableCell>{application.applicant?.name || "N/A"}</TableCell>
                  <TableCell>{application.applicant?.email || "N/A"}</TableCell>
                  <TableCell>
                    {application.applicant?.experience || "N/A"} years
                  </TableCell>
                  <TableCell>
                    <FormControl size="small">
                      <Select
                        value={application.status}
                        onChange={(e) =>
                          handleStatusChange(application._id, e.target.value)
                        }
                        size="small"
                        sx={{
                          minWidth: 120,
                          backgroundColor:
                            application.status === "pending"
                              ? "warning.light"
                              : application.status === "reviewing"
                              ? "info.light"
                              : application.status === "shortlisted"
                              ? "success.light"
                              : application.status === "rejected"
                              ? "error.light"
                              : application.status === "hired"
                              ? "success.dark"
                              : "grey.500",
                          color: "white",
                          "& .MuiSelect-icon": {
                            color: "white",
                          },
                          "&:hover": {
                            backgroundColor:
                              application.status === "pending"
                                ? "warning.main"
                                : application.status === "reviewing"
                                ? "info.main"
                                : application.status === "shortlisted"
                                ? "success.main"
                                : application.status === "rejected"
                                ? "error.main"
                                : application.status === "hired"
                                ? "success.main"
                                : "grey.600",
                          },
                        }}
                      >
                        <MenuItem
                          value="pending"
                          sx={{ color: "warning.main" }}
                        >
                          Pending
                        </MenuItem>
                        <MenuItem value="reviewing" sx={{ color: "info.main" }}>
                          Reviewing
                        </MenuItem>
                        <MenuItem
                          value="shortlisted"
                          sx={{ color: "success.main" }}
                        >
                          Shortlisted
                        </MenuItem>
                        <MenuItem value="rejected" sx={{ color: "error.main" }}>
                          Rejected
                        </MenuItem>
                        <MenuItem value="hired" sx={{ color: "success.dark" }}>
                          Hired
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => window.open(application.resume, "_blank")}
                      color="primary"
                      title="Download Resume"
                    >
                      <DownloadIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewFeedback(application)}
                        color="primary"
                      >
                        <CommentIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No applications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={commentDialogOpen}
        onClose={() => {
          setCommentDialogOpen(false);
          setSelectedApplication(null);
          setComment("");
          setFeedbackMessages([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Feedback Messages
          <IconButton
            onClick={() => {
              setCommentDialogOpen(false);
              setSelectedApplication(null);
              setComment("");
              setFeedbackMessages([]);
            }}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CancelIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedApplication.applicant?.name || "Applicant"}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {selectedApplication.job?.title}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {loadingFeedback ? (
                <Box display="flex" justifyContent="center" my={2}>
                  <CircularProgress size={24} />
                </Box>
              ) : feedbackMessages.length > 0 ? (
                feedbackMessages.map((feedback, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Typography variant="subtitle2" color="primary">
                        Recruiter
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(feedback.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{feedback.content}</Typography>
                  </Paper>
                ))
              ) : (
                <Typography color="text.secondary">
                  No feedback messages available.
                </Typography>
              )}

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Send Feedback"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Type your feedback message..."
                />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setCommentDialogOpen(false);
              setSelectedApplication(null);
              setComment("");
              setFeedbackMessages([]);
            }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleCommentSubmit}
            disabled={!comment.trim()}
            startIcon={<SendIcon />}
          >
            Send Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Applications;
