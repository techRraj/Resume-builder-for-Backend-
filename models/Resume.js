// backend/models/Resume.js
const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Resume'
  },
  template: {
    type: String,
    required: true
  },
  // ✅ CORRECT FIELD NAME: "content" (not "data")
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  version: {
    type: Number,
    default: 1
  },
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  lastPrinted: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);