const mongoose = require("mongoose");

const referralSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  jobId: {
    type: String,
    required: false,
  },
  company: {
    type: String,
    required: true,
  },
  referrerName: {
    type: String,
    required: true,
  },
  referrerEmail: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "closed"],
    default: "active",
  },
  deadline: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt automatically before save
referralSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Referral", referralSchema);
