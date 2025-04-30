const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const User = require("../models/User");

class JobApplicationController {
  // Apply for a job
  async applyForJob(req, res) {
    try {
      console.log("JOB APPLICATION");
      const { jobId, coverLetter } = req.body;

      // Validate required fields
      if (!jobId || !coverLetter) {
        return res.status(400).json({
          message: "Job ID and cover letter are required",
        });
      }

      // Check if job exists and is active
      const job = await Job.findOne({ _id: jobId, status: "active" });
      if (!job) {
        return res.status(404).json({
          message: "Job not found or no longer active",
        });
      }

      // Get user details
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Verify user has uploaded a resume
      if (!user.resume) {
        return res.status(400).json({
          message: "Please upload your resume before applying",
        });
      }

      // Check if user has already applied
      const existingApplication = await JobApplication.findOne({
        job: jobId,
        user: req.userId,
      });

      if (existingApplication) {
        return res.status(400).json({
          message: "You have already applied for this job",
        });
      }

      // Create new application with user details
      const application = new JobApplication({
        job: jobId,
        user: req.userId,
        applicantDetails: {
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          resume: user.resume,
        },
        coverLetter,
      });

      await application.save();

      // Populate job and recruiter details for the response
      await application.populate([
        {
          path: "job",
          select: "title position company",
          populate: {
            path: "recruiter",
            select: "name companyName email",
          },
        },
      ]);

      res.status(201).json({
        message: "Job application submitted successfully",
        application: {
          ...application.toObject(),
          job: {
            ...application.job.toObject(),
            recruiter: {
              name: application.job.recruiter.name,
              companyName: application.job.recruiter.companyName,
            },
          },
        },
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all applications for a user
  async getUserApplications(req, res) {
    try {
      const applications = await JobApplication.find({ user: req.userId })
        .populate({
          path: "job",
          select: "title company position salary location status",
          populate: {
            path: "recruiter",
            select: "companyName",
          },
        })
        .sort({ appliedAt: -1 });

      res.status(200).json({ applications });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get specific application details (for both user and recruiter)
  async getApplicationById(req, res) {
    try {
      const application = await JobApplication.findById(req.params.id).populate(
        [
          {
            path: "job",
            select: "title position company salary location status",
            populate: {
              path: "recruiter",
              select: "name companyName email",
            },
          },
          {
            path: "user",
            select: "name email phoneNumber resume",
          },
        ]
      );

      if (!application) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      // Check if the request is from the applicant or the job's recruiter
      if (
        application.user._id.toString() !== req.userId &&
        application.job.recruiter._id.toString() !== req.userId
      ) {
        return res.status(403).json({
          message: "Not authorized to view this application",
        });
      }

      res.status(200).json({ application });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Withdraw application
  async withdrawApplication(req, res) {
    try {
      const application = await JobApplication.findOne({
        _id: req.params.id,
        user: req.userId,
        status: "pending", // Can only withdraw pending applications
      });

      if (!application) {
        return res.status(404).json({
          message: "Application not found or cannot be withdrawn",
        });
      }

      await application.deleteOne();

      res.status(200).json({
        message: "Application withdrawn successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // For recruiters: Get all applications for a specific job
  async getJobApplications(req, res) {
    try {
      const { jobId } = req.params;

      // Verify the job belongs to the recruiter
      const job = await Job.findOne({
        _id: jobId,
        recruiter: req.userId,
      });

      if (!job) {
        return res.status(404).json({
          message: "Job not found",
        });
      }

      const applications = await JobApplication.find({ job: jobId })
        .select("-__v")
        .populate([
          {
            path: "user",
            select: "name email phoneNumber resume",
          },
          {
            path: "job",
            select: "title position",
          },
        ])
        .sort({ appliedAt: -1 });

      res.status(200).json({
        count: applications.length,
        applications: applications.map((app) => ({
          ...app.toObject(),
          user: {
            name: app.user.name,
            email: app.user.email,
            phoneNumber: app.user.phoneNumber,
            resume: app.user.resume,
          },
        })),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // For recruiters: Update application status
  async updateApplicationStatus(req, res) {
    try {
      const { status } = req.body;
      const { applicationId } = req.params;

      if (
        !["pending", "reviewed", "shortlisted", "rejected"].includes(status)
      ) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      const application = await JobApplication.findById(applicationId).populate(
        "job"
      );

      if (!application) {
        return res.status(404).json({
          message: "Application not found",
        });
      }

      // Verify the job belongs to the recruiter
      if (application.job.recruiter.toString() !== req.userId) {
        return res.status(403).json({
          message: "Not authorized to update this application",
        });
      }

      application.status = status;
      await application.save();

      res.status(200).json({
        message: "Application status updated successfully",
        application,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Add to JobApplicationController class
  async sendMessageToApplicants(req, res) {
    try {
      const { applicationIds, message } = req.body;

      // Verify all applications exist and belong to jobs posted by this recruiter
      const applications = await JobApplication.find({
        _id: { $in: applicationIds },
      }).populate("job");

      if (!applications || applications.length === 0) {
        return res.status(404).json({
          message: "No applications found",
        });
      }

      // Verify recruiter owns all jobs
      const unauthorized = applications.some(
        (app) => app.job.recruiter.toString() !== req.user._id.toString()
      );

      if (unauthorized) {
        return res.status(403).json({
          message: "Not authorized to message some of these applicants",
        });
      }

      // Update applications with message
      await JobApplication.updateMany(
        { _id: { $in: applicationIds } },
        {
          $push: {
            messages: {
              sender: req.user._id,
              content: message,
              timestamp: new Date(),
            },
          },
        }
      );

      res.status(200).json({
        message: "Message sent successfully",
      });
    } catch (error) {
      console.error("Error in sendMessageToApplicants:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new JobApplicationController();
