import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Grid,
  useTheme,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Tooltip,
  Fade,
  Zoom,
  Snackbar,
  LinearProgress,
  Avatar,
} from "@mui/material";
import {
  LocationOn,
  Business,
  AttachMoney,
  Schedule,
  CheckCircle,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Upload as UploadIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const DetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  transition: "all 0.3s ease",
  padding: theme.spacing(1),
  borderRadius: theme.spacing(1),
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    transform: "translateX(8px)",
  },
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applicationError, setApplicationError] = useState(null);
  const [resumeDialogOpen, setResumeDialogOpen] = useState(false);
  const [resumeOption, setResumeOption] = useState("existing");
  const [userProfile, setUserProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [saved, setSaved] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState("");

  useEffect(() => {
    const fetchJobAndApplicationStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/user-auth");
          return;
        }

        const [jobResponse, applicationResponse, profileResponse] =
          await Promise.all([
            axios.get(`${APP_URL}/jobseekers/jobs/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${APP_URL}/jobseekers/jobs/${id}/check-application`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${APP_URL}/jobseekers/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        setJob(jobResponse.data.job);
        setHasApplied(applicationResponse.data.hasApplied);
        setUserProfile(profileResponse.data);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(error.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplicationStatus();
  }, [id, navigate]);

  const handleApply = () => {
    if (hasApplied) return;
    setResumeDialogOpen(true);
  };

  const handleResumeOptionChange = (event) => {
    setResumeOption(event.target.value);
  };

  const handleResumeDialogClose = () => {
    setResumeDialogOpen(false);
    setResumeOption("existing");
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (
        !file.type.includes("pdf") &&
        !file.type.includes("doc") &&
        !file.type.includes("docx")
      ) {
        setApplicationError("Please upload a PDF or Word document");
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setApplicationError("File size should be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setApplicationError(null);
    }
  };

  const handleSubmitApplication = async () => {
    if (hasApplied) return;

    setApplying(true);
    setApplicationError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/user-auth");
        return;
      }

      if (resumeOption === "new") {
        if (!selectedFile) {
          setApplicationError("Please select a resume file");
          setApplying(false);
          return;
        }
      }

      const formData = new FormData();
      if (resumeOption === "new") {
        formData.append("resume", selectedFile);
      }

      await axios.post(`${APP_URL}/jobseekers/jobs/${id}/apply`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setHasApplied(true);
      setResumeDialogOpen(false);
      navigate("/user-dashboard/applications");
    } catch (error) {
      console.error("Error applying for job:", error);
      if (error.response?.status === 409) {
        setApplicationError("You have already applied for this job");
        setHasApplied(true);
      } else {
        setApplicationError(
          error.response?.data?.message ||
            "Failed to submit application. Please try again."
        );
      }
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      const token = localStorage.getItem("token");
      if (saved) {
        await axios.delete(`${APP_URL}/jobseekers/saved-jobs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(false);
        setSnackbar({
          open: true,
          message: "Job removed from saved jobs",
          severity: "info"
        });
      } else {
        await axios.post(`${APP_URL}/jobseekers/saved-jobs/${id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSaved(true);
        setSnackbar({
          open: true,
          message: "Job saved successfully",
          severity: "success"
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to update saved jobs",
        severity: "error"
      });
    }
  };

  const handleShare = () => {
    const link = `${window.location.origin}/job/${id}`;
    setShareLink(link);
    setShareDialogOpen(true);
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

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!job) {
    return (
      <Box p={3}>
        <Alert severity="info">Job not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Fade in={true}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: theme.palette.primary.main,
                    fontSize: "1.5rem",
                  }}
                >
                  {job?.recruiter?.companyName?.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {job?.title}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {job?.recruiter?.companyName}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Tooltip title={saved ? "Remove from saved" : "Save job"}>
                    <IconButton onClick={handleSaveJob} color={saved ? "primary" : "default"}>
                      {saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Share job">
                    <IconButton onClick={handleShare}>
                      <ShareIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Box sx={{ my: 3 }}>
                <DetailItem>
                  <Business />
                  <Typography variant="body1">
                    {job?.recruiter?.companyName}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <LocationOn />
                  <Typography variant="body1">
                    {job?.location || "Remote"}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <AttachMoney />
                  <Typography variant="body1">
                    {job?.salary || "Competitive"}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <Schedule />
                  <Typography variant="body1">
                    Experience: {job?.experience || "Not specified"}
                  </Typography>
                </DetailItem>
                <DetailItem>
                  <Schedule />
                  <Typography variant="body1">
                    {job?.type || "Full Time"}
                  </Typography>
                </DetailItem>
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              <Button
                variant="contained"
                color={hasApplied ? "success" : "primary"}
                size="large"
                fullWidth
                onClick={handleApply}
                disabled={applying || hasApplied}
                startIcon={hasApplied && <CheckCircle />}
                sx={{ maxWidth: 300 }}
              >
                {applying ? "Applying..." : hasApplied ? "Applied" : "Apply Now"}
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Fade>

      {applicationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {applicationError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Zoom in={true} style={{ transitionDelay: "100ms" }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" paragraph>
                  {job?.description}
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <Typography variant="body1" paragraph>
                  {job?.requirements}
                </Typography>

                {job?.skills && job.skills.length > 0 && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" gutterBottom>
                      Required Skills
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      {job.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          sx={{ mr: 1, mb: 1 }}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}
              </CardContent>
            </StyledCard>
          </Zoom>
        </Grid>
        <Grid item xs={12} md={4}>
          <Zoom in={true} style={{ transitionDelay: "200ms" }}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Company Overview
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {job?.companyDescription ||
                    `Join ${job?.recruiter?.companyName} and be part of an innovative team working on exciting projects.`}
                </Typography>
              </CardContent>
            </StyledCard>
          </Zoom>
        </Grid>
      </Grid>

      <Dialog
        open={resumeDialogOpen}
        onClose={handleResumeDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Choose Resume Option
          <IconButton
            onClick={handleResumeDialogClose}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 2, width: "100%" }}>
            <FormLabel component="legend">Select Resume Option</FormLabel>
            <RadioGroup
              value={resumeOption}
              onChange={handleResumeOptionChange}
            >
              <FormControlLabel
                value="existing"
                control={<Radio />}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <DescriptionIcon />
                    <Typography>
                      Use existing resume
                      {userProfile?.resume && (
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (Current: {userProfile.resume.split("/").pop()})
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                value="new"
                control={<Radio />}
                label="Upload new resume"
              />
            </RadioGroup>

            {resumeOption === "new" && (
              <Box
                sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ alignSelf: "flex-start" }}
                >
                  Select Resume
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary">
                    Selected file: {selectedFile.name}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Supported formats: PDF, DOC, DOCX (Max size: 5MB)
                </Typography>
              </Box>
            )}
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResumeDialogClose}>Cancel</Button>
          <Button
            onClick={handleSubmitApplication}
            variant="contained"
            disabled={
              applying ||
              uploadingResume ||
              (resumeOption === "new" && !selectedFile)
            }
          >
            {uploadingResume
              ? "Uploading..."
              : applying
              ? "Applying..."
              : "Continue"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={shareDialogOpen}
        onClose={() => setShareDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Share Job
          <IconButton
            onClick={() => setShareDialogOpen(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={shareLink}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShareDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              navigator.clipboard.writeText(shareLink);
              setSnackbar({
                open: true,
                message: "Link copied to clipboard",
                severity: "success"
              });
              setShareDialogOpen(false);
            }}
          >
            Copy Link
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

export default JobDetails;
