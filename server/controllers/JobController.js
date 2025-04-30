const Job = require("../models/Job");
const JobApplication = require("../models/JobApplication");
const User = require("../models/User");

class JobController {
  // Create a new job posting
  async createJob(req, res) {
    try {
      const { title, description, position, experience, salary, location } =
        req.body;

      // Validate required fields
      if (
        !title ||
        !description ||
        !position ||
        !experience ||
        !salary ||
        !location
      ) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      // Validate experience and salary ranges
      if (experience.min > experience.max) {
        return res.status(400).json({
          message: "Invalid experience range",
        });
      }

      if (salary.min > salary.max) {
        return res.status(400).json({
          message: "Invalid salary range",
        });
      }

      const job = new Job({
        recruiter: req.user._id, // Use req.user._id instead of req.userId
        title,
        description,
        position,
        experience,
        salary,
        location,
      });

      await job.save();

      res.status(201).json({
        message: "Job posted successfully",
        job,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Get all jobs posted by a recruiter
  async getRecruiterJobs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      // Build filter conditions
      const filterConditions = {
        recruiter: req.user._id,
      };

      if (req.query.status) {
        filterConditions.status = req.query.status;
      }

      if (req.query.search) {
        filterConditions.$or = [
          { title: { $regex: req.query.search, $options: "i" } },
          { location: { $regex: req.query.search, $options: "i" } },
        ];
      }

      // Get total count for pagination
      const total = await Job.countDocuments(filterConditions);

      // Fetch jobs with pagination
      const jobs = await Job.find(filterConditions)
        .select("title location experience salary status applicationCount") // Explicitly select fields
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Add application count for each job
      const jobsWithApplications = await Promise.all(
        jobs.map(async (job) => {
          const applicationCount = await JobApplication.countDocuments({
            job: job._id,
          });
          return {
            ...job,
            applicationCount,
          };
        })
      );

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        jobs: jobsWithApplications,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
        },
      });
    } catch (error) {
      console.error("Error in getRecruiterJobs:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // Get a specific job by ID
  async getJobById(req, res) {
    try {
      const job = await Job.findById(req.params.id).populate(
        "recruiter",
        "name companyName"
      );

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.status(200).json({ job });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update a job posting
  async updateJob(req, res) {
    try {
      const job = await Job.findOne({
        _id: req.params.id,
        recruiter: req.user._id,
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const updates = req.body;

      // Validate experience and salary ranges if they're being updated
      if (updates.experience) {
        if (updates.experience.min > updates.experience.max) {
          return res.status(400).json({
            message: "Invalid experience range",
          });
        }
      }

      if (updates.salary) {
        if (updates.salary.min > updates.salary.max) {
          return res.status(400).json({
            message: "Invalid salary range",
          });
        }
      }

      Object.keys(updates).forEach((key) => {
        job[key] = updates[key];
      });

      await job.save();

      res.status(200).json({
        message: "Job updated successfully",
        job,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Delete a job posting
  async deleteJob(req, res) {
    try {
      const job = await Job.findOneAndDelete({
        _id: req.params.id,
        recruiter: req.user._id,
      });

      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.status(200).json({
        message: "Job deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllJobs(req, res) {
    try {
      const jobs = await Job.find({ status: "active" });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getJob(req, res) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async applyForJob(req, res) {
    try {
      console.log("JOB Controller");
      const job = await Job.findById(req.params.id);
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const application = new JobApplication({
        job: job._id,
        user: req.user._id,
        applicantDetails: {
          ...req.body,
          customFields: req.body.customFields,
        },
        coverLetter: req.body.coverLetter,
      });

      await application.save();
      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserApplications(req, res) {
    try {
      const applications = await JobApplication.find({ user: req.user.id })
        .populate("job")
        .sort({ createdAt: -1 });
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  async updateUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      // Remove fields that shouldn't be updated
      delete updates.password;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true }
      ).select("-password");

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new JobController();
