import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  FormLabel,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 800,
  margin: "auto",
  marginTop: theme.spacing(4),
}));

const ApplyReferral = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [referral, setReferral] = useState(null);
  const [resumeOption, setResumeOption] = useState("existing");
  const [formData, setFormData] = useState({
    message: "",
    resume: null,
  });
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchUserProfile();
    fetchReferralDetails();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${APP_URL}/jobseekers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(response.data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchReferralDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${APP_URL}/referrals/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReferral(response.data);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch referral details"
      );
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      resume: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("name", userProfile?.name || "");
      formDataToSend.append("email", userProfile?.email || "");
      formDataToSend.append("message", formData.message);

      if (resumeOption === "new" && formData.resume) {
        formDataToSend.append("resume", formData.resume);
      }

      await axios.post(`${APP_URL}/referrals/${id}/apply`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess("Application submitted successfully!");
      setTimeout(() => {
        navigate("/user-dashboard");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
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

  return (
    <StyledCard>
      <CardContent>
        <Typography variant="h4" gutterBottom>
          Apply for Referral
        </Typography>
        <Typography variant="h6" gutterBottom>
          {referral?.title}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {referral?.company}
        </Typography>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Your Information
              </Typography>
              <Typography variant="body1">Name: {userProfile?.name}</Typography>
              <Typography variant="body1">
                Email: {userProfile?.email}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Resume Option</FormLabel>
                <RadioGroup
                  value={resumeOption}
                  onChange={(e) => setResumeOption(e.target.value)}
                >
                  <FormControlLabel
                    value="existing"
                    control={<Radio />}
                    label="Use existing resume"
                  />
                  <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label="Upload new resume"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {resumeOption === "new" && (
              <Grid item xs={12}>
                <Button variant="outlined" component="label" fullWidth>
                  Select Resume
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                  />
                </Button>
                {formData.resume && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Selected file: {formData.resume.name}
                  </Typography>
                )}
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                multiline
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                required
                placeholder="Explain why you're interested in this opportunity"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </StyledCard>
  );
};

export default ApplyReferral;
