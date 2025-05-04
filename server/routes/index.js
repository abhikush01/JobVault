const express = require("express");
const router = express.Router();
const authRoutes = require("./auth");
const jobRoutes = require("./job");
const recruiterRoutes = require("./recruiter");
const jobApplicationRoutes = require("./jobApplication");
const jobSeekerRoutes = require("./jobSeeker");
const Referral = require("./ReferralRoutes");

router.use("/auth", authRoutes);
router.use("/jobs", jobRoutes);
router.use("/applications", jobApplicationRoutes);
router.use("/jobseekers", jobSeekerRoutes);
router.use("/referrals", Referral);
router.use("/recruiters", recruiterRoutes);

module.exports = router;
