const express = require("express");
const router = express.Router();
const JobApplicationController = require("../controllers/JobApplicationController");
const auth = require("../middleware/Auth");
const recruiterOnly = require("../middleware/RecruiterOnly");

// All routes require authentication
router.use(auth);

// User routes
router.post("/apply", JobApplicationController.applyForJob);
router.get("/my-applications", JobApplicationController.getUserApplications);
router.get("/application/:id", JobApplicationController.getApplicationById);
router.delete("/withdraw/:id", JobApplicationController.withdrawApplication);

// Recruiter routes (protected by recruiterOnly middleware)
router.get(
  "/job/:jobId/applications",
  recruiterOnly,
  JobApplicationController.getJobApplications
);
router.put(
  "/application/:applicationId/status",
  recruiterOnly,
  JobApplicationController.updateApplicationStatus
);

// New route for sending messages to applicants
router.post(
  "/message",
  recruiterOnly,
  JobApplicationController.sendMessageToApplicants
);

module.exports = router;
