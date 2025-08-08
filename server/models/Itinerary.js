const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Itinerary name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'campaign', 'event'],
    required: [true, 'Itinerary type is required']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed'],
    default: 'draft'
  },
  tasks: [{
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    order: {
      type: Number,
      required: true
    },
    scheduledDate: {
      type: Date
    },
    isOptional: {
      type: Boolean,
      default: false
    },
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }]
  }],
  schedule: {
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date
    },
    recurrence: {
      type: String,
      enum: ['none', 'daily', 'weekly', 'monthly'],
      default: 'none'
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }],
    timeSlots: [{
      startTime: String,
      endTime: String
    }]
  },
  targetAudience: {
    roles: [{
      type: String,
      enum: ['admin', 'staff', 'user']
    }],
    ageRange: {
      min: Number,
      max: Number
    },
    regions: [String]
  },
  metrics: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
itinerarySchema.index({ type: 1, status: 1, isActive: 1 });
itinerarySchema.index({ 'schedule.startDate': 1, 'schedule.endDate': 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);