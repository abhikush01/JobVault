const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recruiter',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'selected', 'rejected'],
    default: 'pending'
  },
  feedback: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feedback'
  }],
  resume: {
    type: String // URL to resume file
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Application', applicationSchema); 