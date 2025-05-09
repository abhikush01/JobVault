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
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Message as MessageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Work as WorkIcon,
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
      : status === "accepted"
      ? theme.palette.success.light
      : status === "rejected"
      ? theme.palette.error.light
      : theme.palette.info.light,
  color: theme.palette.common.white,
}));

const UserApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    type: "job", // job or referral
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        {filters.type === "job" ? "Job Applications" : "Referral Applications"}
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
      </Paper>

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
            {applications.map((application) => (
              <StyledTableRow key={application._id}>
                <TableCell>
                  {filters.type === "job"
                    ? application?.job?.title || "N/A"
                    : application?.referral?.jobTitle || "N/A"}
                </TableCell>
                <TableCell>
                  {filters.type === "job"
                    ? application?.job?.company || "N/A"
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
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedApplication(application);
                      setDetailsDialogOpen(true);
                    }}
                  >
                    <MessageIcon />
                  </IconButton>
                </TableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {filters.type === "job"
                    ? selectedApplication?.job?.title || "N/A"
                    : selectedApplication?.referral?.jobTitle || "N/A"}
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  {filters.type === "job"
                    ? selectedApplication?.job?.company || "N/A"
                    : selectedApplication?.referral?.company || "N/A"}
                </Typography>
                {filters.type === "referral" && (
                  <>
                    <Typography color="text.secondary" gutterBottom>
                      Referrer:{" "}
                      {selectedApplication?.referral?.referrerName || "N/A"}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Referrer Email:{" "}
                      {selectedApplication?.referral?.referrerEmail || "N/A"}
                    </Typography>
                  </>
                )}
                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                  <StatusChip
                    label={
                      filters.type === "job"
                        ? selectedApplication?.status || "N/A"
                        : selectedApplication?.referral?.status || "N/A"
                    }
                    status={
                      filters.type === "job"
                        ? selectedApplication?.status || "N/A"
                        : selectedApplication?.referral?.status || "N/A"
                    }
                  />
                </Box>
                <Typography variant="body2">
                  Applied on:{" "}
                  {filters.type === "job"
                    ? new Date(
                        selectedApplication?.createdAt
                      ).toLocaleDateString()
                    : new Date(
                        selectedApplication?.appliedDate
                      ).toLocaleDateString()}
                </Typography>
                {filters.type === "referral" && (
                  <Typography variant="body2">
                    Deadline:{" "}
                    {selectedApplication?.referral?.deadline
                      ? new Date(
                          selectedApplication.referral.deadline
                        ).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                )}
              </Paper>

              {filters.type === "job" ? (
                <>
                  {selectedApplication?.recruiterComment && (
                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        Recruiter's Comment
                      </Typography>
                      <Typography variant="body1">
                        {selectedApplication.recruiterComment}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Last updated:{" "}
                        {selectedApplication?.updatedAt
                          ? new Date(
                              selectedApplication.updatedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </Paper>
                  )}

                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Your Application
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedApplication?.coverLetter ||
                        "No cover letter provided"}
                    </Typography>
                  </Paper>
                </>
              ) : (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Referrer's Message
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedApplication?.referral?.message ||
                      "No message provided"}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserApplications;
