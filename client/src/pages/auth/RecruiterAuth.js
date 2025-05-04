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
  Grid,
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

const RecruiterAuth = () => {
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
    designation: "",
    companyName: "",
    companyWebsite: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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

          if (response.data.valid && response.data.role === "recruiter") {
            navigate("/recruiter-dashboard");
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
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleInitialSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${APP_URL}/auth/recruiter/signup`, {
        email: formData.email,
        password: formData.password,
      });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${APP_URL}/auth/recruiter/verify`,
        formData
      );
      localStorage.setItem("token", response.data.token);
      navigate("/recruiter-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${APP_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: "recruiter",
      });
      localStorage.setItem("token", response.data.token);
      navigate("/recruiter-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.email) {
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
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
            <Typography variant="h3" gutterBottom>
              Build your{" "}
              <span style={{ color: theme.palette.primary.main }}>
                dream team
              </span>
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              1-stop solution to hire best talent for your business.
            </Typography>
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" gutterBottom>
                Trusted by 10+ global brands
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 2,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <img
                  src="/company1.png"
                  alt="Company 1"
                  style={{ height: 40 }}
                />
                <img
                  src="/company2.png"
                  alt="Company 2"
                  style={{ height: 40 }}
                />
                <img
                  src="/company3.png"
                  alt="Company 3"
                  style={{ height: 40 }}
                />
                <img
                  src="/company4.png"
                  alt="Company 4"
                  style={{ height: 40 }}
                />
              </Box>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <AuthPaper elevation={3}>
            <Box textAlign="center" mb={4}>
              <Typography variant="h4" gutterBottom>
                {step === 3 ? "Welcome Back!" : "Create Account"}
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {step === 1 && (
              <form onSubmit={handleInitialSignup}>
                <TextField
                  fullWidth
                  label="Work Email"
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
                  {loading ? "Loading..." : "Sign Up"}
                </Button>
                <Box textAlign="center" mt={2}>
                  <Typography variant="body2">
                    Already have an account?{" "}
                    <Button
                      color="primary"
                      onClick={() => setStep(3)}
                      sx={{ textTransform: "none" }}
                    >
                      Sign in
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
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Company Name"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Company Website"
                  name="companyWebsite"
                  value={formData.companyWebsite}
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
                  {loading ? "Loading..." : "Complete Profile"}
                </Button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Work Email"
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
                  {loading ? "Loading..." : "Sign in"}
                </Button>
                <Box textAlign="center" mt={2}>
                  <Typography variant="body2">
                    Don't have an account?{" "}
                    <Button
                      color="primary"
                      onClick={() => setStep(1)}
                      sx={{ textTransform: "none" }}
                    >
                      Sign up
                    </Button>
                  </Typography>
                </Box>
              </form>
            )}
          </AuthPaper>
        </Grid>
      </Grid>
    </AuthContainer>
  );
};

export default RecruiterAuth;
