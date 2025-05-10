const express = require("express");
const router = express.Router();
const JobSeekerController = require("../controllers/JobSeekerController");
const auth = require("../middleware/Auth");
const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const upload = require("../utils/multerConfig");

// Apply auth middleware to all routes
router.use(auth);

// Job listing and search routes
router.get("/jobs", JobSeekerController.getAllJobs);
router.get("/jobs/:id", JobSeekerController.getJobDetails);

// Application routes
router.post(
  "/jobs/:id/apply",
  upload.single("resume"),
  JobSeekerController.applyForJob
);
router.get("/applications", JobSeekerController.getUserApplications);
router.get("/applications/:id", JobSeekerController.getApplicationDetails);
router.delete("/applications/:id", JobSeekerController.withdrawApplication);

// Profile routes
router.get("/profile", JobSeekerController.getUserProfile);
router.put(
  "/profile",
  upload.single("resume"),
  JobSeekerController.updateProfile
);
router.post(
  "/profile/resume",
  upload.single("resume"),
  JobSeekerController.uploadResume
);

// Get applications for a specific job
router.get("/job/:jobId/applications", auth, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    console.log("Fetching applications for job:", jobId);

    // First verify the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Find all applications for this job
    const applications = await JobApplication.find({
      job: jobId,
    })
      .populate({
        path: "applicant",
        select: "name email",
      })
      .populate({
        path: "job",
        select: "title company",
      })
      .sort({ createdAt: -1 });

    console.log("Found applications:", {
      count: applications.length,
      applications: applications.map((app) => ({
        id: app._id,
        applicantName: app.applicant?.name,
        applicantEmail: app.applicant?.email,
        status: app.status,
        jobId: app.job,
      })),
    });

    res.json({
      success: true,
      applications,
      count: applications.length,
      jobId,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
});

// Check if user has already applied to a job
router.get("/jobs/:id/check-application", async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const application = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    });

    res.json({ hasApplied: !!application });
  } catch (error) {
    console.error("Error checking application status:", error);
    res.status(500).json({ message: "Error checking application status" });
  }
});

// Debug route to check all applications
router.get("/debug/all-applications", auth, async (req, res) => {
  try {
    const allApplications = await JobApplication.find()
      .populate("applicant", "name email")
      .populate("job", "title company");

    console.log("All applications in DB:", {
      count: allApplications.length,
      applications: allApplications.map((app) => ({
        id: app._id,
        jobId: app.job,
        applicantId: app.applicant?._id,
        applicantName: app.applicant?.name,
        status: app.status,
      })),
    });

    res.json({
      count: allApplications.length,
      applications: allApplications,
    });
  } catch (error) {
    console.error("Error in debug route:", error);
    res.status(500).json({ message: "Error fetching debug data" });
  }
});

// Update application status
router.patch("/applications/:applicationId/status", auth, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    console.log("Updating application status:", { applicationId, status }); // Debug log

    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Update the status
    application.status = status;
    await application.save();

    // Return updated application with populated fields
    const updatedApplication = await JobApplication.findById(applicationId)
      .populate("applicant", "name email")
      .populate("job", "title");

    res.json({
      message: "Application status updated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ message: "Error updating application status" });
  }
});

// Get user's applications
router.get("/applications", auth, async (req, res) => {
  try {
    console.log("Fetching applications for user:", req.user.id);

    const applications = await JobApplication.find({
      applicant: req.user.id,
    })
      .populate({
        path: "job",
        select: "title company description location salary",
      })
      .sort({ createdAt: -1 });

    console.log("Found applications:", {
      count: applications.length,
      applications: applications.map((app) => ({
        id: app._id,
        jobTitle: app.job?.title,
        company: app.job?.company,
        status: app.status,
        appliedDate: app.createdAt,
      })),
    });

    res.json({
      success: true,
      applications,
      count: applications.length,
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching applications",
      error: error.message,
    });
  }
});

// Add a debug route to check the application creation
router.get("/debug/check-application/:jobId", auth, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    console.log("Checking application for:", { userId, jobId });

    const application = await JobApplication.findOne({
      job: jobId,
      applicant: userId,
    })
      .populate("job", "title company")
      .populate("applicant", "name email");

    console.log("Found application:", application);

    res.json({
      exists: !!application,
      application,
    });
  } catch (error) {
    console.error("Error checking application:", error);
    res.status(500).json({ message: "Error checking application" });
  }
});

module.exports = router;
