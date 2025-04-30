const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: function() {
      return this.isVerified; // Only required after verification
    }
  },
  name: {
    type: String,
    required: function() {
      return this.isVerified; // Only required after verification
    }
  },
  phoneNumber: {
    type: String,
    required: function() {
      return this.isVerified; // Only required after verification
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: Number,
    default: 0
  },
  education: {
    degree: String,
    field: String,
    institution: String,
    year: Number
  },
  location: {
    type: String
  },
  resume: {
    type: String // URL to resume
  },
  otp: {
    code: String,
    expiresAt: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 