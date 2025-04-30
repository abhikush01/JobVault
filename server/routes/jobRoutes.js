const express = require("express");
const Job = require("../models/Job");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/my-jobs/applications", authMiddleware, async (req, res) => {
  try {
    // Get recruiter's ID from the authenticated user
    const recruiterId = req.user.userId;

    // Find all jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: recruiterId })
      .select("title createdAt") // Only select necessary fields
      .sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching recruiter jobs:", error);
    res
      .status(500)
      .json({ message: "Error fetching jobs", error: error.message });
  }
});

module.exports = router;
