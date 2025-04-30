const mongoose = require("mongoose");

const referralApplicationSchema = new mongoose.Schema(
  {
    referral: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Referral",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

referralApplicationSchema.index(
  { referral: 1, applicant: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "ReferralApplication",
  referralApplicationSchema
);
