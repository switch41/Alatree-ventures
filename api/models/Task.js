const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['survey', 'quiz', 'challenge', 'event', 'submission'],
    required: [true, 'Task type is required']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  points: {
    type: Number,
    required: [true, 'Points value is required'],
    min: [0, 'Points cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badges: [{
      type: String,
      trim: true
    }],
    prizes: [{
      name: String,
      value: Number,
      description: String
    }]
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  participantCount: {
    type: Number,
    default: 0
  },
  completionRate: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for performance
taskSchema.index({ type: 1, category: 1, isActive: 1 });
taskSchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model('Task', taskSchema);