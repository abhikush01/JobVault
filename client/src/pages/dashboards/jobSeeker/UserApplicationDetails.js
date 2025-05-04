import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from "@mui/lab";
import {
  Work,
  LocationOn,
  Business,
  CalendarToday,
  CheckCircle,
  Pending,
  Cancel,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StatusChip = styled(Chip)(({ theme, status }) => {
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return theme.palette.success;
      case "rejected":
        return theme.palette.error;
      case "pending":
        return theme.palette.warning;
      default:
        return theme.palette.info;
    }
  };
  const statusColor = getStatusColor();
  return {
    backgroundColor: statusColor.light,
    color: statusColor.dark,
    "& .MuiChip-label": {
      fontWeight: 600,
    },
  };
});

const InfoItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginBottom: theme.spacing(2),
  "& .MuiSvgIcon-root": {
    marginRight: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));

const UserApplicationDetails = () => {
  const { id } = useParams();
  const theme = useTheme();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${APP_URL}/jobseekers/applications/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setApplication(response.data.application);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application details:", error);
        setError(
          error.response?.data?.message || "Failed to load application details"
        );
        setLoading(false);
      }
    };

    fetchApplicationDetails();
  }, [id]);

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

  if (!application) {
    return (
      <Box p={3}>
        <Alert severity="info">Application not found</Alert>
      </Box>
    );
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return <CheckCircle color="success" />;
      case "rejected":
        return <Cancel color="error" />;
      case "pending":
        return <Pending color="warning" />;
      default:
        return <Pending />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {application.job?.title}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {application.job?.company}
            </Typography>

            <Box sx={{ my: 3 }}>
              <InfoItem>
                <Business />
                <Typography>{application.job?.company}</Typography>
              </InfoItem>
              <InfoItem>
                <LocationOn />
                <Typography>{application.job?.location || "Remote"}</Typography>
              </InfoItem>
              <InfoItem>
                <CalendarToday />
                <Typography>
                  Applied on:{" "}
                  {new Date(application.appliedDate).toLocaleDateString()}
                </Typography>
              </InfoItem>
              <InfoItem>
                <Work />
                <Typography>{application.job?.type || "Full Time"}</Typography>
              </InfoItem>
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
            <StatusChip
              label={application.status}
              status={application.status}
              icon={getStatusIcon(application.status)}
              sx={{ px: 3, py: 2, "& .MuiChip-label": { fontSize: "1.1rem" } }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Timeline
              </Typography>
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <CalendarToday />
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="subtitle1">
                      Application Submitted
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(application.appliedDate).toLocaleDateString()}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                {application.status !== "Pending" && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot
                        color={
                          application.status === "Accepted"
                            ? "success"
                            : "error"
                        }
                      >
                        {getStatusIcon(application.status)}
                      </TimelineDot>
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="subtitle1">
                        Application {application.status}
                      </Typography>
                      {application.updatedAt && (
                        <Typography variant="body2" color="text.secondary">
                          {new Date(application.updatedAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>
            </CardContent>
          </Card>

          {application.feedback && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recruiter Feedback
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {application.feedback}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          {application.status === "Accepted" && application.nextSteps && (
            <Card sx={{ bgcolor: "success.light" }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Next Steps
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: "pre-line" }}>
                  {application.nextSteps}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              {application.job?.description && (
                <Typography variant="body2" paragraph>
                  {application.job.description}
                </Typography>
              )}
              {application.job?.skills && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Required Skills
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {application.job.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserApplicationDetails;
