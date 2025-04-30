const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/AuthController");
const { auth } = require("../middleware/Auth");
const ReferralController = require("../controllers/ReferralController");

// User routes
router.post("/user/signup", AuthController.userSignup.bind(AuthController));
router.post(
  "/user/verify-and-complete",
  AuthController.userVerifyAndComplete.bind(AuthController)
);

// Recruiter routes
router.post(
  "/recruiter/signup",
  AuthController.recruiterSignup.bind(AuthController)
);
router.post(
  "/recruiter/verify",
  AuthController.recruiterVerifyAndComplete.bind(AuthController)
);

// Common login route
router.post("/login", AuthController.login.bind(AuthController));

// Verify token route
router.get("/verify", AuthController.verifyToken.bind(AuthController));

module.exports = router;
