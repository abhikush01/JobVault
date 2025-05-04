import React, { useState } from "react";
import { Box, Tabs, Tab, Paper } from "@mui/material";
import JobList from "./JobList";
import AppliedReferrals from "./AppliedReferrals";

const UserDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label="Browse Jobs" />
          <Tab label="My Applications" />
        </Tabs>

        <Box sx={{ mt: 3 }}>
          {tabValue === 0 && <JobList />}
          {tabValue === 1 && <AppliedReferrals />}
        </Box>
      </Paper>
    </Box>
  );
};

export default UserDashboard;
