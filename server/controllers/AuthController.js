const User = require("../models/User");
const Recruiter = require("../models/Recruiter");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-email-password",
  },
});

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: "uploads/resumes",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
}).single("resume");

class AuthController {
  // Generate OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP via email
  async sendOTP(email, otp) {
    const transporter = nodemailer.createTransport({
      // Configure your email service
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification OTP",
      text: `Your OTP is: ${otp}`,
    });
  }

  // User Signup
  async userSignup(req, res) {
    try {
      const { email } = req.body;

      // Check if user exists and is verified
      let user = await User.findOne({ email });
      if (user && user.isVerified) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

      if (user) {
        // Update existing unverified user with new OTP
        user.otp = {
          code: otp,
          expiresAt: otpExpiry,
        };
      } else {
        // Create new user with OTP
        user = new User({
          email,
          otp: {
            code: otp,
            expiresAt: otpExpiry,
          },
        });
      }

      await user.save({ validateBeforeSave: false }); // Skip validation for initial save

      // Send OTP via email
      await this.sendOTP(email, otp);

      res.status(201).json({
        message: "OTP sent successfully",
        email,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: error.message });
    }
  }

  // User Verify OTP
  async userVerify(req, res) {
    try {
      const { email, otp } = req.body;

      // Validate required fields
      if (!email || !otp) {
        return res.status(400).json({
          message: "Email and OTP are required",
        });
      }

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      if (user.otp.code !== otp) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      if (user.otp.expiresAt < Date.now()) {
        return res.status(400).json({
          message: "OTP has expired",
        });
      }

      // Only mark OTP as verified, keep other fields for complete profile
      user.otpVerified = true;
      await user.save();

      res.status(200).json({
        message: "OTP verified successfully",
        email: user.email,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async userCompleteProfile(req, res) {
    try {
      upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
          return res.status(400).json({
            message: "File upload error",
            error: err.message,
          });
        } else if (err) {
          return res.status(400).json({
            message: "Invalid file type or size",
            error: err.message,
          });
        }

        const { email, name, phoneNumber } = req.body;

        // Validate required fields
        if (!email || !name || !phoneNumber) {
          return res.status(400).json({
            message: "All fields are required",
          });
        }

        // Validate phone number format
        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phoneNumber)) {
          return res.status(400).json({
            message: "Invalid phone number format. Must be 10 digits.",
          });
        }

        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json({
            message: "User not found",
          });
        }

        if (!user.otpVerified) {
          return res.status(400).json({
            message: "Please verify OTP first",
          });
        }

        user.name = name;
        user.phoneNumber = phoneNumber;
        user.isVerified = true;
        user.resume = req.file ? req.file.path : null;
        user.otp = undefined;
        user.otpVerified = undefined;

        await user.save();

        const token = jwt.sign(
          {
            id: user._id,
            role: "user",
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.status(200).json({
          token,
          message: "Profile completed successfully",
          user: {
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            resume: user.resume,
          },
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Recruiter Signup
  async recruiterSignup(req, res) {
    try {
      const { email, password } = req.body;

      const existingRecruiter = await Recruiter.findOne({ email });
      if (existingRecruiter) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const otp = this.generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // Create recruiter with only email and password initially
      const recruiter = new Recruiter({
        email,
        password,
        name: "temp",
        phoneNumber: "temp",
        designation: "temp",
        companyName: "temp",
        companyWebsite: "temp",
        otp: {
          code: otp,
          expiresAt: otpExpiry,
        },
      });

      await recruiter.save();
      await this.sendOTP(email, otp);

      res.status(201).json({
        message: "OTP sent to email",
        email: email,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Recruiter Verify OTP and Complete Profile
  async recruiterVerifyAndComplete(req, res) {
    try {
      const {
        email,
        otp,
        name,
        phoneNumber,
        designation,
        companyName,
        companyWebsite,
      } = req.body;

      // Validate required fields
      if (
        !email ||
        !otp ||
        !name ||
        !phoneNumber ||
        !designation ||
        !companyName ||
        !companyWebsite
      ) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      const recruiter = await Recruiter.findOne({ email });
      if (
        !recruiter ||
        recruiter.otp.code !== otp ||
        recruiter.otp.expiresAt < Date.now()
      ) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Update recruiter profile
      recruiter.name = name;
      recruiter.phoneNumber = phoneNumber;
      recruiter.designation = designation;
      recruiter.companyName = companyName;
      recruiter.companyWebsite = companyWebsite;
      recruiter.isVerified = true;
      recruiter.otp = undefined;

      await recruiter.save();

      const token = jwt.sign(
        {
          id: recruiter._id,
          role: "recruiter",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        token,
        message: "Profile completed successfully",
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Login (for both User and Recruiter)
  async login(req, res) {
    try {
      const { email, password, role } = req.body;

      const Model = role === "recruiter" ? Recruiter : User;
      const account = await Model.findOne({ email });

      if (!account || !account.isVerified) {
        return res
          .status(401)
          .json({ message: "Invalid credentials or unverified account" });
      }

      const isPasswordValid = await bcrypt.compare(password, account.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate token with role
      const token = jwt.sign(
        {
          id: account._id,
          role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({ token });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // Update the verifyToken method in AuthController
  async verifyToken(req, res) {
    try {
      // Get token from request header
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          valid: false,
          message: "No token provided",
        });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user based on decoded id
      const user = await User.findById(decoded.id);
      const recruiter = await Recruiter.findById(decoded.id);

      const account = user || recruiter;

      if (!account) {
        return res.status(401).json({
          valid: false,
          message: "Invalid token",
        });
      }

      // Determine role
      const role = recruiter ? "recruiter" : "user";

      res.status(200).json({
        valid: true,
        role,
        userId: account._id,
      });
    } catch (error) {
      console.error("Token verification error:", error);
      res.status(401).json({
        valid: false,
        message: "Invalid token",
      });
    }
  }

  async userVerifyAndComplete(req, res) {
    try {
      const {
        email,
        otp,
        password,
        name,
        phoneNumber,
        skills,
        experience,
        education,
        location,
      } = req.body;

      // Validate required fields
      if (!email || !otp || !password || !name || !phoneNumber) {
        return res.status(400).json({
          message: "All required fields must be provided",
        });
      }

      const user = await User.findOne({ email });
      if (!user || user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Handle skills - ensure it's an array
      const skillsArray = Array.isArray(skills) ? skills : [];

      // Update user profile
      user.password = password;
      user.name = name;
      user.phoneNumber = phoneNumber;
      user.skills = skillsArray;
      user.experience = experience || 0;
      user.education = education || {};
      user.location = location;
      user.isVerified = true;
      user.otp = undefined;

      await user.save();

      // Generate token
      const token = jwt.sign(
        {
          id: user._id,
          role: "user",
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        message: "Registration completed successfully",
        token,
      });
    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new AuthController();
