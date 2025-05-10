const JobApplication = require("../models/JobApplication");
const Job = require("../models/Job");
const User = require("../models/User");
const sendMail = require("../utils/sendMail");

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
      console.log(jobId);
      // Verify the job belongs to the recruiter
      const job = await Job.findOne({
        _id: jobId,
        recruiter: req.user.id,
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
            path: "applicant",
            select: "name email phoneNumber resume experience",
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
            name: app.applicant.name,
            email: app.applicant.email,
            phoneNumber: app.applicant.phoneNumber,
            resume: app.applicant.resume,
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
        !["pending", "reviewing", "shortlisted", "rejected", "hired"].includes(
          status
        )
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

      console.log("recruiter", application.job.recruiter.toString());
      console.log("user", req.user.id);
      // Verify the job belongs to the recruiter
      if (application.job.recruiter.toString() !== req.user.id) {
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
      const { applicationId, message } = req.body;
      const recruiterId = req.user._id;

      const application = await JobApplication.findById(applicationId).populate(
        "applicant"
      );

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      if (application.recruiter.toString() !== recruiterId.toString()) {
        return res.status(403).json({
          message: "Unauthorized to send feedback for this application",
        });
      }

      // Push feedback
      application.feedbacks.push({
        sender: recruiterId,
        content: message,
        timestamp: new Date(),
      });

      await application.save();

      // Send email to applicant
      const applicantEmail = application.applicant.email;
      await sendMail({
        to: applicantEmail,
        subject: "Feedback on your job application",
        text: message,
      });
      res.status(200).json({ message: "Feedback sent and email delivered" });
    } catch (error) {
      console.error("Error in sendFeedbackToApplicant:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getFeedbackMessgaes(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await JobApplication.findById(applicationId).select(
        "feedbacks applicant recruiter"
      );

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Only allow recruiter or applicant to view feedbacks
      const userId = req.user._id.toString();
      if (
        application.applicant.toString() !== userId &&
        application.recruiter.toString() !== userId
      ) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      console.log(application.feedbacks);

      res.status(200).json({ feedbacks: application.feedbacks });
    } catch (error) {
      console.error("Error in getFeedbacksForApplication:", error);
      res.status(500).json({ message: "Failed to retrieve feedbacks" });
    }
  }
}

module.exports = new JobApplicationController();
