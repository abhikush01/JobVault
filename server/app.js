const express = require("express");
const app = express();
const jobSeekerRoutes = require("./routes/jobSeeker");
const jobRoutes = require("./routes/jobs");
const recruiterRoutes = require("./routes/recruiter");
const cors = require("cors");
const jobApplicationRoutes = require("./routes/jobApplication");

// Middleware
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/jobseekers", jobSeekerRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/recruiters", recruiterRoutes);
app.use("/api/applications", jobApplicationRoutes);

module.exports = app;
