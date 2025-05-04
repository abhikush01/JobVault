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
} from "@mui/material";
import {
  LocationOn,
  Business,
  AttachMoney,
  Schedule,
  CheckCircle,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const DetailItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
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

  useEffect(() => {
    const fetchJobAndApplicationStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/user-auth");
          return;
        }

        const [jobResponse, applicationResponse] = await Promise.all([
          axios.get(`${APP_URL}/jobseekers/jobs/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${APP_URL}/jobseekers/jobs/${id}/check-application`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setJob(jobResponse.data.job);
        setHasApplied(applicationResponse.data.hasApplied);
      } catch (error) {
        console.error("Error fetching job details:", error);
        setError(error.response?.data?.message || "Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndApplicationStatus();
  }, [id, navigate]);

  const handleApply = async () => {
    if (hasApplied) return;

    setApplying(true);
    setApplicationError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/user-auth");
        return;
      }

      await axios.post(
        `${APP_URL}/jobseekers/jobs/${id}/apply`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setHasApplied(true);
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
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {job.company}
            </Typography>

            <Box sx={{ my: 3 }}>
              <DetailItem>
                <Business />
                <Typography variant="body1">{job.company}</Typography>
              </DetailItem>
              <DetailItem>
                <LocationOn />
                <Typography variant="body1">
                  {job.location || "Remote"}
                </Typography>
              </DetailItem>
              <DetailItem>
                <AttachMoney />
                <Typography variant="body1">
                  {job.salary || "Competitive"}
                </Typography>
              </DetailItem>
              <DetailItem>
                <Schedule />
                <Typography variant="body1">
                  {job.type || "Full Time"}
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

      {applicationError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {applicationError}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Description
              </Typography>
              <Typography variant="body1" paragraph>
                {job.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Requirements
              </Typography>
              <Typography variant="body1" paragraph>
                {job.requirements}
              </Typography>

              {job.skills && job.skills.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {job.skills.map((skill, index) => (
                      <Chip key={index} label={skill} sx={{ mr: 1, mb: 1 }} />
                    ))}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Company Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {job.companyDescription ||
                  `Join ${job.company} and be part of an innovative team working on exciting projects.`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default JobDetails;
