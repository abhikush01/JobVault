const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: false
  },
  location: {
    type: String,
    required: true
  },
  salary: {
    type: String,
    required: true
  },
  customFields: [{
    fieldName: String,
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'file'],
      default: 'text'
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Job', jobSchema); 