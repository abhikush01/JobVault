const express = require("express");
const router = express.Router();
const RecruiterController = require("../controllers/RecruiterController");
const auth = require("../middleware/Auth");
const recruiterOnly = require("../middleware/RecruiterOnly");

// All routes require authentication and recruiter role
router.use(auth);
router.use(recruiterOnly);

// Profile routes
router.get("/profile", RecruiterController.getProfile);
router.put("/profile", RecruiterController.updateProfile);

module.exports = router;
