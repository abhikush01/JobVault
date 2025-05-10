const Job = require("../models/Job");
const Application = require("../models/Application");
const User = require("../models/User");
const JobApplication = require("../models/JobApplication");
const cloudinary = require("cloudinary").v2;
const qs = require("qs");
const { Readable } = require("stream");
const FormData = require("form-data");
const uploadToCloudinary = require("../utils/cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

class JobSeekerController {
  // Get all available jobs with filters
  async getAllJobs(req, res) {
    try {
      const {
        search,
        location,
        experienceMin,
        experienceMax,
        salaryMin,
        salaryMax,
      } = req.query;

      let query = {};

      // Add search filter
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { position: { $regex: search, $options: "i" } },
        ];
      }

      // Add location filter
      if (location) {
        query.location = { $regex: location, $options: "i" };
      }

      // Add experience filter
      if (experienceMin || experienceMax) {
        query.experience = {};
        if (experienceMin) query.experience.$gte = parseInt(experienceMin);
        if (experienceMax) query.experience.$lte = parseInt(experienceMax);
      }

      // Add salary filter
      if (salaryMin || salaryMax) {
        query.salary = {};
        if (salaryMin) query.salary.$gte = parseInt(salaryMin);
        if (salaryMax) query.salary.$lte = parseInt(salaryMax);
      }

      const jobs = await Job.find(query)
        .populate("recruiter", "name companyName")
        .sort({ createdAt: -1 });

      res.status(200).json({ jobs });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get specific job details
  async getJobDetails(req, res) {
    try {
      const job = await Job.findById(req.params.id).populate(
        "recruiter",
        "companyName companyWebsite"
      );

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      console.log(job);

      // Check if user has already applied
      const hasApplied = await Application.exists({
        job: job._id,
        applicant: req.user._id,
      });

      res.status(200).json({
        job,
        hasApplied,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Apply for a job
  async applyForJob(req, res) {
    try {
      const jobId = req.params.id;
      const userId = req.user.id;
      const resumeUrl = req.user.resume;

      if (req.file) {
        resumeUrl = await uploadToCloudinary(req.file);
      }

      if (!resumeUrl) {
        return res.status(404).json({ message: "Resume is required" });
      }

      console.log("Applying for job:", { jobId, userId });

      // Check if job exists
      const job = await Job.findById(jobId);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Check if already applied
      const existingApplication = await JobApplication.findOne({
        job: jobId,
        applicant: userId,
      });

      if (existingApplication) {
        return res
          .status(400)
          .json({ message: "You have already applied for this job" });
      }

      // Create new application
      const application = new JobApplication({
        job: jobId,
        applicant: userId,
        recruiter: job.recruiter,
        status: "pending",
        resume: resumeUrl,
      });

      await application.save();

      // Populate the application details
      const populatedApplication = await JobApplication.findById(
        application._id
      )
        .populate("job", "title company")
        .populate("applicant", "name email");

      res.status(201).json({
        message: "Application submitted successfully",
        application: populatedApplication,
      });
    } catch (error) {
      console.error("Error in applyForJob:", error);
      res.status(500).json({
        message: "Error submitting application",
        error: error.message,
      });
    }
  }

  // Get user's applications
  async getUserApplications(req, res) {
    try {
      const applications = await JobApplication.find({
        applicant: req.user.id,
      })
        .populate({
          path: "job",
          select: "title company description location salary recruiter",
          populate: {
            path: "recruiter",
            select: "companyName", // Only fetch companyName
          },
        })
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        applications,
        count: applications.length,
      });
      console.log(applications);
    } catch (error) {
      console.error("Error fetching user applications:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get specific application details
  async getApplicationDetails(req, res) {
    try {
      const application = await Application.findOne({
        _id: req.params.id,
        applicant: req.user._id,
      })
        .populate("job")
        .populate("recruiter", "name companyName")
        .populate("feedback");

      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.status(200).json({ application });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Withdraw application
  async withdrawApplication(req, res) {
    try {
      const application = await Application.findOneAndDelete({
        _id: req.params.id,
        applicant: req.user._id,
        status: "pending", // Can only withdraw pending applications
      });

      if (!application) {
        return res.status(404).json({
          message: "Application not found or cannot be withdrawn",
        });
      }

      res.status(200).json({
        message: "Application withdrawn successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get user profile
  async getUserProfile(req, res) {
    try {
      const user = await User.findById(req.user._id).select("-password");

      res.status(200).json({ user });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const user = await User.findById(req.user._id);
      const resume = req.file;
      const resumeUrl = req.user.resume;

      if (resume) {
        resumeUrl = await uploadToCloudinary(resume);
        user.resume = resumeUrl;
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update allowed fields
      const allowedUpdates = [
        "name",
        "phoneNumber",
        "skills",
        "experience",
        "education",
        "location",
      ];

      allowedUpdates.forEach((field) => {
        if (updates[field] !== undefined) {
          user[field] = updates[field];
        }
      });

      await user.save();

      res.status(200).json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Upload resume
  async uploadResume(req, res) {
    try {
      const chunks = [];

      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", async () => {
        const buffer = Buffer.concat(chunks);

        // Upload to cloudinary
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "auto",
              folder: "resumes",
              flags: "attachment:false",
            },

            async (error, result) => {
              if (error) {
                return res.status(500).json({ error: error.message });
              } else {
                const fileLink = result.secure_url;

                // Update user's resume field
                const user = await User.findByIdAndUpdate(
                  req.user.id,
                  { resume: fileLink },
                  { new: true }
                );

                if (!user) {
                  return res.status(404).json({ error: "User not found" });
                }

                return res.json({
                  message: "Resume uploaded successfully",
                  resumeUrl: fileLink,
                  user,
                });
              }
            }
          )
          .end(buffer);
      });

      req.on("error", (err) => {
        console.error(err);
        res.status(500).json({ error: "Error reading file" });
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
}

module.exports = new JobSeekerController();
