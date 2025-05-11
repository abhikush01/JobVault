import React, { useState, useEffect } from "react";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  useTheme,
  Input,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Fade,
  Zoom,
  Snackbar,
  Avatar,
  Badge,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person,
  Email,
  Phone,
  LocationOn,
  School,
  Work,
  Description as DescriptionIcon,
  CloudUpload as CloudUploadIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const InfoItem = styled(Box)(({ theme }) => ({
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

const SkillChip = styled(Chip)(({ theme }) => ({
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.05)",
  },
}));

const UserProfile = () => {
  const theme = useTheme();
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    skills: [],
    experience: 0,
    education: {
      degree: "",
      field: "",
      institution: "",
      year: "",
    },
    resume: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${APP_URL}/jobseekers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userData = response.data.user;

      const profileData = {
        name: userData.name || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        location: userData.location || "",
        skills: userData.skills || [],
        experience: userData.experience || 0,
        education: {
          degree: userData.education?.degree || "",
          field: userData.education?.field || "",
          institution: userData.education?.institution || "",
          year: userData.education?.year || "",
        },
        resume: userData.resume || "",
      };

      setProfile(profileData);
      setEditedProfile(profileData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError(error.response?.data?.message || "Failed to load profile");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedProfile((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setEditedProfile((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(",").map((skill) => skill.trim());
    setEditedProfile((prev) => ({ ...prev, skills }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !editedProfile.skills.includes(newSkill.trim())) {
      setEditedProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
      setSnackbar({
        open: true,
        message: "Skill added successfully!",
        severity: "success"
      });
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setEditedProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
    setSnackbar({
      open: true,
      message: "Skill removed successfully!",
      severity: "info"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${APP_URL}/jobseekers/profile`, editedProfile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(editedProfile);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: "Profile updated successfully!",
        severity: "success"
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update profile");
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update profile",
        severity: "error"
      });
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes("pdf")) {
      setResumeError("Please upload a PDF file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File size should be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setConfirmDialogOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;

    setUploadingResume(true);
    setResumeError("");
    setConfirmDialogOpen(false);

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${APP_URL}/jobseekers/profile/resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const resumeUrl = response.data.resumeUrl;
      setEditedProfile((prev) => ({ ...prev, resume: resumeUrl }));
      setProfile((prev) => ({ ...prev, resume: resumeUrl }));
      setSelectedFile(null);
    } catch (error) {
      setResumeError(
        error.response?.data?.message ||
          "Failed to upload resume. Please try again."
      );
      console.error("Error uploading resume:", error);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setConfirmDialogOpen(false);
    setResumeError("");
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={fetchProfile}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Fade in={true}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: theme.palette.primary.main,
                  fontSize: "1.5rem",
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h4">{profile.name}</Typography>
            </Box>
            <Tooltip title={isEditing ? "Cancel Editing" : "Edit Profile"}>
              <IconButton
                color="primary"
                onClick={() => setIsEditing(!isEditing)}
                size="large"
              >
                {isEditing ? <CancelIcon /> : <EditIcon />}
              </IconButton>
            </Tooltip>
          </Box>

          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    name="name"
                    value={editedProfile.name}
                    onChange={handleInputChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    value={editedProfile.email}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="phoneNumber"
                    value={editedProfile.phoneNumber}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    name="location"
                    value={editedProfile.location}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Add New Skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddSkill();
                        }
                      }}
                    />
                    <Tooltip title="Add Skill">
                      <IconButton
                        color="primary"
                        onClick={handleAddSkill}
                        disabled={!newSkill.trim()}
                      >
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {editedProfile.skills.map((skill, index) => (
                      <SkillChip
                        key={index}
                        label={skill}
                        onDelete={() => handleRemoveSkill(skill)}
                        color="primary"
                        variant="outlined"
                        deleteIcon={<DeleteIcon />}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Years of Experience"
                    name="experience"
                    type="number"
                    value={editedProfile.experience}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Education
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Degree"
                    name="education.degree"
                    value={editedProfile.education.degree}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Field of Study"
                    name="education.field"
                    value={editedProfile.education.field}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Institution"
                    name="education.institution"
                    value={editedProfile.education.institution}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Graduation Year"
                    name="education.year"
                    type="number"
                    value={editedProfile.education.year}
                    onChange={handleInputChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Resume
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Button
                        component="label"
                        variant="outlined"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploadingResume}
                      >
                        Select Resume
                        <Input
                          type="file"
                          sx={{ display: "none" }}
                          onChange={handleFileSelect}
                          accept=".pdf"
                        />
                      </Button>
                      {uploadingResume && <CircularProgress size={24} />}
                      {editedProfile?.resume && !uploadingResume && (
                        <Typography variant="body2" color="text.secondary">
                          Resume uploaded successfully
                        </Typography>
                      )}
                    </Box>
                    {resumeError && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {resumeError}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 4,
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setIsEditing(false)}
                  startIcon={<CancelIcon />}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                >
                  Save Changes
                </Button>
              </Box>
            </form>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Zoom in={true}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Personal Information
                      </Typography>
                      <InfoItem>
                        <Person />
                        <Typography>{profile.name || "Not specified"}</Typography>
                      </InfoItem>
                      <InfoItem>
                        <Email />
                        <Typography>{profile.email || "Not specified"}</Typography>
                      </InfoItem>
                      <InfoItem>
                        <Phone />
                        <Typography>
                          {profile.phoneNumber || "Not specified"}
                        </Typography>
                      </InfoItem>
                      <InfoItem>
                        <LocationOn />
                        <Typography>
                          {profile.location || "Not specified"}
                        </Typography>
                      </InfoItem>
                    </CardContent>
                  </StyledCard>
                </Zoom>
              </Grid>

              <Grid item xs={12} md={6}>
                <Zoom in={true} style={{ transitionDelay: "100ms" }}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Professional Information
                      </Typography>
                      <InfoItem>
                        <Work />
                        <Typography>
                          {profile.experience} years of experience
                        </Typography>
                      </InfoItem>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Skills
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {profile.skills && profile.skills.length > 0 ? (
                            profile.skills.map((skill, index) => (
                              <SkillChip
                                key={index}
                                label={skill}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ))
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No skills listed
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Zoom>
              </Grid>

              <Grid item xs={12}>
                <Zoom in={true} style={{ transitionDelay: "200ms" }}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Education
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <School sx={{ mr: 2, color: "primary.main" }} />
                        <Box>
                          <Typography variant="subtitle1">
                            {profile.education?.degree || "Degree not specified"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {profile.education?.field || "Field not specified"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {profile.education?.institution ||
                              "Institution not specified"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Graduated:{" "}
                            {profile.education?.year || "Year not specified"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Zoom>
              </Grid>

              <Grid item xs={12}>
                <Zoom in={true} style={{ transitionDelay: "300ms" }}>
                  <StyledCard>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resume
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <DescriptionIcon sx={{ color: "primary.main" }} />
                        {profile.resume ? (
                          <Button
                            variant="outlined"
                            href={profile.resume}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Resume
                          </Button>
                        ) : (
                          <Typography color="text.secondary">
                            No resume uploaded
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Zoom>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Fade>

      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelUpload}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Resume Upload</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to upload this resume? This will replace your
            current resume.
          </Typography>
          {selectedFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Selected file:</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFile.name} (
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload}>Cancel</Button>
          <Button
            onClick={handleConfirmUpload}
            variant="contained"
            color="primary"
          >
            Upload Resume
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

export default UserProfile;
