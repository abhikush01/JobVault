import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { APP_URL } from "../../../lib/Constant";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
  Avatar,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Paper,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Pagination,
  CardMedia,
  CardActions,
  Divider,
  Stack,
} from "@mui/material";
import {
  Search as SearchIcon,
  LocationOn,
  AttachMoney,
  AccessTime,
  Work,
  Business,
  CalendarToday,
  People,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const ITEMS_PER_PAGE = 8;

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const CompanyAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  backgroundColor: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
}));

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    location: "",
  });
  const [userProfile, setUserProfile] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchUserProfile();
    fetchData();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${APP_URL}/jobseekers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserProfile(response.data);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [jobsResponse, referralsResponse] = await Promise.all([
        axios.get(`${APP_URL}/jobseekers/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${APP_URL}/referrals/getAll`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const processedJobs = Array.isArray(jobsResponse.data.jobs)
        ? jobsResponse.data.jobs.map((job) => ({ ...job, isReferral: false }))
        : [];

      const processedReferrals = Array.isArray(referralsResponse.data)
        ? referralsResponse.data.map((referral) => ({
            ...referral,
            isReferral: true,
          }))
        : [];

      setJobs(processedJobs);
      setReferrals(processedReferrals);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const filteredData = useMemo(() => {
    let filteredJobs = Array.isArray(jobs)
      ? jobs.filter((job) => job.status === "active")
      : [];
    let filteredReferrals = Array.isArray(referrals) ? referrals : [];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job?.title?.toLowerCase().includes(searchLower) ||
          job?.description?.toLowerCase().includes(searchLower) ||
          job?.recruiter?.companyName?.toLowerCase().includes(searchLower)
      );
      filteredReferrals = filteredReferrals.filter(
        (referral) =>
          referral?.title?.toLowerCase().includes(searchLower) ||
          referral?.company?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.location) {
      filteredJobs = filteredJobs.filter(
        (job) => job?.location?.toLowerCase() === filters.location.toLowerCase()
      );
    }

    return { filteredJobs, filteredReferrals };
  }, [jobs, referrals, searchTerm, filters]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    let data = [];
    if (tabValue === 0) {
      data = [
        ...(Array.isArray(filteredData.filteredJobs)
          ? filteredData.filteredJobs
          : []),
        ...(Array.isArray(filteredData.filteredReferrals)
          ? filteredData.filteredReferrals
          : []),
      ];
    } else if (tabValue === 1) {
      data = Array.isArray(filteredData.filteredJobs)
        ? filteredData.filteredJobs
        : [];
    } else {
      data = Array.isArray(filteredData.filteredReferrals)
        ? filteredData.filteredReferrals
        : [];
    }

    return data.slice(startIndex, endIndex);
  }, [filteredData, tabValue, page]);

  const totalPages = useMemo(() => {
    const totalItems =
      tabValue === 0
        ? (Array.isArray(filteredData.filteredJobs)
            ? filteredData.filteredJobs.length
            : 0) +
          (Array.isArray(filteredData.filteredReferrals)
            ? filteredData.filteredReferrals.length
            : 0)
        : tabValue === 1
        ? Array.isArray(filteredData.filteredJobs)
          ? filteredData.filteredJobs.length
          : 0
        : Array.isArray(filteredData.filteredReferrals)
        ? filteredData.filteredReferrals.length
        : 0;
    return Math.ceil(totalItems / ITEMS_PER_PAGE);
  }, [filteredData, tabValue]);

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
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Job Opportunities
          </Typography>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="All" />
            <Tab label="Regular Jobs" />
            <Tab label="Referral Posts" />
          </Tabs>
        </Box>

        <Stack spacing={2} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title or description"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  label="Location"
                >
                  <MenuItem value="">All Locations</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                  <MenuItem value="Hybrid">Hybrid</MenuItem>
                  <MenuItem value="On-site">On-site</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>

        <Grid container spacing={3}>
          {paginatedData.map((item) => (
            <Grid item xs={12} md={6} key={item._id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <CompanyAvatar>
                      {item.isReferral ? <People /> : <Business />}
                    </CompanyAvatar>
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {item.isReferral ? item.jobTitle : item.title}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        gutterBottom
                      >
                        {item.recruiter?.companyName}
                      </Typography>
                      {item.company && (
                        <Typography color="text.secondary">
                          {item.company}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box
                    sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}
                  >
                    {item.isReferral ? (
                      <>
                        <Chip
                          icon={<Work />}
                          label="Referral"
                          color="primary"
                          size="small"
                        />
                        <Chip
                          icon={<CalendarToday />}
                          label={`Deadline: ${new Date(
                            item.deadline
                          ).toLocaleDateString()}`}
                          size="small"
                        />
                      </>
                    ) : (
                      <>
                        {item.location && (
                          <Chip
                            icon={<LocationOn />}
                            label={item.location}
                            size="small"
                          />
                        )}
                        {item.salary && (
                          <Chip
                            icon={<AttachMoney />}
                            label={item.salary}
                            size="small"
                          />
                        )}
                      </>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="body2" color="text.secondary">
                    {item.description?.substring(0, 150) ||
                      item.message?.substring(0, 150)}
                    ...
                  </Typography>
                </CardContent>
                <CardActions sx={{ mt: "auto", p: 2 }}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() =>
                      item.isReferral
                        ? navigate(`/referral/${item._id}/apply`, {
                            state: { userProfile },
                          })
                        : navigate(`/user-dashboard/job-details/${item._id}`)
                    }
                  >
                    {item.isReferral ? "Apply for Referral" : "View Details"}
                  </Button>
                </CardActions>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              size="large"
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default JobList;
