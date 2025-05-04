const Referral = require("../models/Referral");
const ReferralApplication = require("../models/ReferralApplication");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const uploadToCloudinary = require("../utils/cloudinary");
const axios = require("axios");

class ReferralController {
  // Create a new Referral posting
  async createReferralJob(req, res) {
    try {
      const { title, jobId, company, name, email, message, deadline } =
        req.body;

      // Validate required fields
      if (!title || !company || !name || !email || !deadline) {
        return res.status(400).json({
          message: "Please fill required fields",
        });
      }

      // Create a new referral document
      const newReferral = new Referral({
        jobTitle: title,
        jobId: jobId,
        company,
        referrerName: name,
        referrerEmail: email,
        message,
        deadline,
      });

      // Save referral in database first
      const savedReferral = await newReferral.save();

      // Setup nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: savedReferral.referrerEmail, // Corrected here
        subject: `Referral Post for ${title} at ${company} Created`,
        text: `
        Hi ${name},

        Your Referral Post Created Successfully.

        Thanks,
        Your Referral Service
      `,
      };

      // Send email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err.message);
          // Even if email fails, referral is created
          return res.status(201).json({
            message: "Referral created, but email failed to send",
            error: err.message,
            referral: savedReferral,
          });
        }

        // Success
        res.status(201).json({
          message: "Referral Post Created and Email sent successfully",
          info,
          referral: savedReferral,
        });
      });
    } catch (error) {
      console.error("Error creating referral:", error.message);
      res.status(500).json({ message: error.message });
    }
  }

  // Get a specific job by ID
  async getJobById(req, res) {
    try {
      const referralPost = await Referral.findById(req.params.id);

      if (!referralPost) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({ referralPost });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getAllReferralJobs(req, res) {
    try {
      const jobs = await Referral.find({ status: "active" });
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getJob(req, res) {
    try {
      const job = await Referral.findById(req.params.id);
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
      const referral = await Referral.findById(req.params.id);
      if (!referral) {
        return res.status(404).json({ message: "Referral not found" });
      }

      const data = new FormData();
      data.append("file", req.file);

      const options = {
        method: "POST",
        url: "https://resume-parser-and-analyzer.p.rapidapi.com/api/v1/cv/",
        headers: {
          "x-rapidapi-key":
            "32a9bf8063msh346623c9a951473p1cb1fdjsna6c0de81c486",
          "x-rapidapi-host": "resume-parser-and-analyzer.p.rapidapi.com",
        },
        data: data,
      };

      try {
        const response = await axios.request(options);
        console.log(response.data);
      } catch (error) {
        console.error(error.message);
      }

      const resume = req.file;
      const resumeUrl = await uploadToCloudinary(resume);

      const message = req.body.message || "";
      const applicantName = req.user.name;
      const applicantEmail = req.user.email;

      // Email content
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: referral.referrerEmail,
        subject: `New Application for ${referral.jobTitle} at ${referral.company}`,
        text: `
                Hi ${referral.referrerName},
                
                ${applicantName} has applied for the ${referral.jobTitle} position at ${referral.company}.
                
                Applicant Details:
                - Name: ${applicantName}
                - Email: ${applicantEmail}
                - Resume: ${resumeUrl}
                
                Additional Message:
                ${message}
                
                Please reach out to them for further referral steps.
                
                Thanks,
                Your Referral Service
                      `,
      };
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      // Send email
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Failed to send email", error: err.message });
        }
        res
          .status(200)
          .json({ message: "Application submitted successfully", info });
      });

      const existingApplication = await ReferralApplication.findOne({
        referral: req.params.id,
        applicant: String(req.user._id),
      });

      if (existingApplication) {
        return res.status(400).json({
          message: "You have already applied for this",
        });
      }

      const newApplication = new ReferralApplication({
        referral: req.params.id,
        applicant: String(req.user._id),
      });
      await newApplication.save();

      res.status(201).json({
        message: "Application submitted successfully",
        newApplication,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserApplications(req, res) {
    try {
      const applications = await ReferralApplication.find({ user: req.user.id })
        .populate("referral")
        .sort({ createdAt: -1 });
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new ReferralController();
