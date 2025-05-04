import React, { useState, useEffect } from "react";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import {
  Work,
  Business,
  CalendarToday,
  CheckCircle,
  Pending,
  Cancel,
  People,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = ({ status }) => {
  const getStatusProps = () => {
    switch (status?.toLowerCase()) {
      case "pending":
        return {
          icon: <Pending />,
          color: "warning",
          label: "Pending",
        };
      case "accepted":
        return {
          icon: <CheckCircle />,
          color: "success",
          label: "Accepted",
        };
      case "rejected":
        return {
          icon: <Cancel />,
          color: "error",
          label: "Rejected",
        };
      default:
        return {
          icon: <Pending />,
          color: "default",
          label: "Unknown",
        };
    }
  };

  const { icon, color, label } = getStatusProps();

  return (
    <Chip icon={icon} label={label} color={color} size="small" sx={{ ml: 1 }} />
  );
};

const AppliedReferralPosts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appliedReferrals, setAppliedReferrals] = useState([]);

  useEffect(() => {
    fetchAppliedReferrals();
  }, []);

  const fetchAppliedReferrals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${APP_URL}/jobseekers/applied-referrals`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppliedReferrals(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch applied referrals"
      );
      setLoading(false);
    }
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

  if (appliedReferrals.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          You haven't applied to any referral posts yet.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        Applied Referral Posts
      </Typography>
      <Grid container spacing={3}>
        {appliedReferrals.map((application) => (
          <Grid item xs={12} key={application._id}>
            <StyledCard>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {application.referral?.title}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {application.referral?.company}
                    </Typography>
                  </Box>
                  <StatusChip status={application.status} />
                </Box>

                <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
                  <Chip
                    icon={<Work />}
                    label="Referral"
                    color="primary"
                    size="small"
                  />
                  <Chip
                    icon={<CalendarToday />}
                    label={`Applied: ${new Date(
                      application.createdAt
                    ).toLocaleDateString()}`}
                    size="small"
                  />
                  {application.referral?.deadline && (
                    <Chip
                      icon={<People />}
                      label={`Deadline: ${new Date(
                        application.referral.deadline
                      ).toLocaleDateString()}`}
                      size="small"
                    />
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Your Message:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {application.message}
                </Typography>

                {application.resume && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Attached Resume:
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      href={application.resume}
                      target="_blank"
                    >
                      View Resume
                    </Button>
                  </Box>
                )}

                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Referral Details:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {application.referral?.description}
                  </Typography>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AppliedReferralPosts;
