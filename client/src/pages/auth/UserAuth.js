import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../lib/Constant";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  width: "100%",
  maxWidth: 600,
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
  },
}));

const UserAuth = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
    name: "",
    phoneNumber: "",
    skills: "",
    experience: "",
    education: {
      degree: "",
      field: "",
      institution: "",
      year: "",
    },
    location: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await axios.get(`${APP_URL}/auth/verify`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.valid && response.data.role === "user") {
            navigate("/user-dashboard");
          } else {
            localStorage.removeItem("token");
          }
        } catch (err) {
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${APP_URL}/auth/user/signup`, {
        email: formData.email,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const validateEducation = () => {
    const { degree, field, institution, year } = formData.education;
    if (degree || field || institution || year) {
      if (!degree || !field || !institution || !year) {
        setError("Please complete all education fields");
        return false;
      }
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        setError("Please enter a valid graduation year");
        return false;
      }
    }
    return true;
  };

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateEducation()) {
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        ...formData,
        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean)
          : [],
      };

      const response = await axios.post(
        `${APP_URL}/auth/user/verify-and-complete`,
        requestData
      );

      localStorage.setItem("token", response.data.token);
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${APP_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: "user",
      });
      localStorage.setItem("token", response.data.token);
      navigate("/user-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContainer>
      <AuthPaper elevation={3}>
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" gutterBottom>
            {step === 3 ? "Welcome Back!" : "Join Our Community"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {step === 1 &&
              "Start your journey with us. Create an account to explore job opportunities."}
            {step === 2 &&
              "Tell us more about yourself to help you find the perfect job match."}
            {step === 3 &&
              "Sign in to access your dashboard and continue your job search."}
          </Typography>
        </Box>

        {step !== 3 && (
          <Stepper activeStep={step - 1} alternativeLabel sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Email Verification</StepLabel>
            </Step>
            <Step>
              <StepLabel>Complete Profile</StepLabel>
            </Step>
          </Stepper>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {step === 1 && (
          <form onSubmit={handleSignup}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Sending OTP..." : "Get Started"}
            </Button>
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Already have an account?{" "}
                <Button
                  color="primary"
                  onClick={() => setStep(3)}
                  sx={{ textTransform: "none" }}
                >
                  Sign In
                </Button>
              </Typography>
            </Box>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyAndComplete}>
            <TextField
              fullWidth
              label="OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Create Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Skills (comma separated)"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Years of Experience"
              name="experience"
              type="number"
              value={formData.experience}
              onChange={handleChange}
              margin="normal"
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Education Details
            </Typography>
            <TextField
              fullWidth
              label="Degree"
              name="education.degree"
              value={formData.education.degree}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Field of Study"
              name="education.field"
              value={formData.education.field}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Institution"
              name="education.institution"
              value={formData.education.institution}
              onChange={handleChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Graduation Year"
              name="education.year"
              type="number"
              value={formData.education.year}
              onChange={handleChange}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              margin="normal"
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Creating Account..." : "Complete Registration"}
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              required
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={loading}
              sx={{ mt: 3 }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
            <Box textAlign="center" mt={2}>
              <Typography variant="body2">
                Don't have an account?{" "}
                <Button
                  color="primary"
                  onClick={() => setStep(1)}
                  sx={{ textTransform: "none" }}
                >
                  Sign Up
                </Button>
              </Typography>
            </Box>
          </form>
        )}
      </AuthPaper>
    </AuthContainer>
  );
};

export default UserAuth;
