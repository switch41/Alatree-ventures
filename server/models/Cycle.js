const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Cycle name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  type: {
    type: String,
    enum: ['draw', 'competition', 'challenge'],
    required: [true, 'Cycle type is required']
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  drawDate: {
    type: Date
  },
  entryFee: {
    type: Number,
    default: 0,
    min: [0, 'Entry fee cannot be negative']
  },
  maxEntries: {
    type: Number,
    default: 1000
  },
  prizes: [{
    position: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    description: String,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  entries: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    entryDate: {
      type: Date,
      default: Date.now
    },
    paymentId: String,
    amount: Number
  }],
  winners: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prize: {
      position: Number,
      name: String,
      value: Number
    },
    selectedDate: {
      type: Date,
      default: Date.now
    }
  }],
  metrics: {
    totalEntries: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    conversionRate: {
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

module.exports = mongoose.model('Cycle', cycleSchema);