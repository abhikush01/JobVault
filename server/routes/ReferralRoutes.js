const express = require("express");
const router = express.Router();
const ReferralController = require("../controllers/ReferralController");
const auth = require("../middleware/Auth");
console.log(auth);

router.post("/", ReferralController.createReferralJob);
router.get("/getAll", auth, ReferralController.getAllReferralJobs);
router.get("/referrals/:id", auth, ReferralController.getJobById);
router.post("/:id/apply", auth, ReferralController.applyForJob);
router.get("/applications", auth, ReferralController.getUserApplications);

module.exports = router;
