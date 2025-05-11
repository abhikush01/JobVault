import React, { useState, useEffect } from "react";
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
  Tooltip,
  Fade,
  Zoom,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Avatar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    transform: "scale(1.01)",
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor:
    status === "pending"
      ? theme.palette.warning.light
      : status === "accepted"
      ? theme.palette.success.light
      : status === "rejected"
      ? theme.palette.error.light
      : theme.palette.info.light,
  color: theme.palette.common.white,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const FeedbackCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const UserApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [feedbackMessages, setFeedbackMessages] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "job", // job or referral
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [filters]);

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem("token");
      let response;

      if (filters.type === "job") {
        response = await axios.get(`${APP_URL}/jobseekers/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...filters, type: "job" },
        });
        setApplications(response.data.applications || []);
      } else {
        response = await axios.get(`${APP_URL}/referrals/applications`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ...filters, type: "referral" },
        });
        setApplications(response.data || []);
      }

      console.log(applications);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleViewDetails = async (application) => {
    setSelectedApplication(application);
    setDetailsDialogOpen(true);
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
      console.log("Feedbacks", feedbackMessages);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to fetch feedback messages");
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchApplications();
      setSnackbar({
        open: true,
        message: "Applications refreshed successfully",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to refresh applications",
        severity: "error"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleDownloadResume = async (applicationId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${APP_URL}/applications/${applicationId}/resume`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `resume-${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSnackbar({
        open: true,
        message: "Resume downloaded successfully",
        severity: "success"
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to download resume",
        severity: "error"
      });
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Fade in={true}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4">
              {filters.type === "job" ? "Job Applications" : "Referral Applications"}
            </Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Tooltip title="Refresh Applications">
                <IconButton onClick={handleRefresh} disabled={refreshing}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <TextField
              size="small"
              placeholder={`Search ${filters.type} applications...`}
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
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={handleFilterChange}
                name="type"
                label="Type"
              >
                <MenuItem value="job">Jobs</MenuItem>
                <MenuItem value="referral">Referrals</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Company</TableCell>
                  {filters.type === "referral" && <TableCell>Referrer</TableCell>}
                  <TableCell>Status</TableCell>
                  <TableCell>Applied Date</TableCell>
                  {filters.type === "referral" && <TableCell>Deadline</TableCell>}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {applications.map((application, index) => (
                  <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }} key={application._id}>
                    <StyledTableRow>
                      <TableCell>
                        {filters.type === "job"
                          ? application?.job?.title || "N/A"
                          : application?.referral?.jobTitle || "N/A"}
                      </TableCell>
                      <TableCell>
                        {filters.type === "job"
                          ? application?.job?.recruiter?.companyName || "N/A"
                          : application?.referral?.company || "N/A"}
                      </TableCell>
                      {filters.type === "referral" && (
                        <TableCell>
                          {application?.referral?.referrerName || "N/A"}
                        </TableCell>
                      )}
                      <TableCell>
                        <StatusChip
                          label={
                            filters.type === "job"
                              ? application?.status || "N/A"
                              : application?.referral?.status || "N/A"
                          }
                          status={
                            filters.type === "job"
                              ? application?.status || "N/A"
                              : application?.referral?.status || "N/A"
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {filters.type === "job"
                          ? new Date(application?.createdAt).toLocaleDateString()
                          : new Date(application?.appliedDate).toLocaleDateString()}
                      </TableCell>
                      {filters.type === "referral" && (
                        <TableCell>
                          {application?.referral?.deadline
                            ? new Date(
                                application.referral.deadline
                              ).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(application)}
                            >
                              <MessageIcon />
                            </IconButton>
                          </Tooltip>
                          {application.resume && (
                            <Tooltip title="Download Resume">
                              <IconButton
                                size="small"
                                onClick={() => handleDownloadResume(application._id)}
                              >
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </StyledTableRow>
                  </Zoom>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Fade>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedApplication(null);
          setFeedbackMessages([]);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Application Details
          <IconButton
            onClick={() => {
              setDetailsDialogOpen(false);
              setSelectedApplication(null);
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
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: theme.palette.primary.main,
                      }}
                    >
                      {filters.type === "job"
                        ? selectedApplication?.job?.recruiter?.companyName?.charAt(0)
                        : selectedApplication?.referral?.company?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {filters.type === "job"
                          ? selectedApplication?.job?.title
                          : selectedApplication?.referral?.jobTitle}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        {filters.type === "job"
                          ? selectedApplication?.job?.recruiter?.companyName
                          : selectedApplication?.referral?.company}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Feedback Messages
                  </Typography>

                  {loadingFeedback ? (
                    <Box display="flex" justifyContent="center" my={2}>
                      <CircularProgress size={24} />
                    </Box>
                  ) : feedbackMessages.length > 0 ? (
                    <Grid container spacing={2}>
                      {feedbackMessages.map((feedback, index) => (
                        <Grid item xs={12} key={index}>
                          <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                            <FeedbackCard>
                              <CardContent>
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
                              </CardContent>
                            </FeedbackCard>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      No feedback messages available.
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDetailsDialogOpen(false);
              setSelectedApplication(null);
              setFeedbackMessages([]);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserApplications;
