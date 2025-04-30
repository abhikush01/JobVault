const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');
const auth = require('../middleware/Auth');
const recruiterOnly = require('../middleware/RecruiterOnly');

// Apply auth middleware to all routes
router.use(auth);

// Apply recruiter check to specific routes
router.post('/', recruiterOnly, JobController.createJob);
router.get('/my-jobs', recruiterOnly, JobController.getRecruiterJobs);
router.get('/my-jobs/:id', recruiterOnly, JobController.getJobById);
router.put('/my-jobs/:id', recruiterOnly, JobController.updateJob);
router.delete('/my-jobs/:id', recruiterOnly, JobController.deleteJob);

module.exports = router; 