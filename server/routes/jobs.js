const express = require('express');
const router = express.Router();
const jobController = require('../controllers/JobController');
const auth = require('../middleware/Auth');
const recruiterOnly = require('../middleware/RecruiterOnly');
const JobApplication = require('../models/JobApplication');
const Job = require('../models/Job');

// Get all jobs with pagination and filters

// Get all jobs and specific job
router.get('/job/:id', jobController.getJob);

// Job applications
router.get('/applications', auth, jobController.getUserApplications);
router.post('/job/:id/apply', auth, jobController.applyForJob);

// Profile routes
router.get('/profile', auth, jobController.getUserProfile);
router.put('/profile', auth, jobController.updateUserProfile);

// Recruiter job management
router.post('/create', auth, jobController.createJob);
router.get('/my-jobs', auth, recruiterOnly, jobController.getRecruiterJobs);
router.put('/job/:id', auth, jobController.updateJob);
router.delete('/job/:id', auth, jobController.deleteJob);

// Get applications for a specific job
router.get('/my-jobs/:jobId/applications', auth, recruiterOnly, async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const applications = await JobApplication.find({ job: jobId })
      .populate('applicant', 'name email')
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// Update application status
router.patch('/my-jobs/:jobId/applications/:applicationId/status', auth, recruiterOnly, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    console.log('Updating application status:', { applicationId, status }); // Debug log

    const application = await JobApplication.findById(applicationId);

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Verify that the recruiter owns the job
    const job = await Job.findById(application.job);
    if (!job || job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    application.status = status;
    await application.save();

    const updatedApplication = await JobApplication.findById(applicationId)
      .populate('applicant', 'name email')
      .populate('job', 'title');

    res.json({ 
      message: 'Application status updated successfully',
      application: updatedApplication 
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Error updating application status' });
  }
});

module.exports = router; 