const express = require("express");
const router = express.Router();
const ReferralController = require("../controllers/ReferralController");
const auth = require("../middleware/Auth");
const upload = require("../utils/multerConfig");

router.post("/", ReferralController.createReferralJob);
router.get("/getAll", auth, ReferralController.getAllReferralJobs);
router.get("/applications", auth, ReferralController.getUserApplications);
router.get("/:id", auth, ReferralController.getJobById);
router.post(
  "/:id/apply",
  upload.single("resume"),
  auth,
  ReferralController.applyForJob
);

module.exports = router;
