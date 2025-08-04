const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  staffId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  staffType: {
    type: String,
    enum: ['DOCTOR', 'NURSE'],
    required: true
  },
  leaveType: {
    type: String,
    enum: ['ANNUAL', 'SICK', 'MATERNITY', 'EMERGENCY', 'CONFERENCE', 'TRAINING', 'OTHER'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED'],
    default: 'PENDING'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
leaveSchema.index({ staffId: 1, startDate: 1, endDate: 1 });
leaveSchema.index({ status: 1, startDate: 1 });

// Virtual to check if leave is currently active
leaveSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'APPROVED' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Static method to check if staff is on leave
leaveSchema.statics.isStaffOnLeave = async function(staffId, date = new Date()) {
  const leave = await this.findOne({
    staffId: staffId,
    status: 'APPROVED',
    startDate: { $lte: date },
    endDate: { $gte: date }
  }).populate('staffId', 'name specialization department');
  
  return leave;
};

// Static method to get all staff on leave for a date range
leaveSchema.statics.getStaffOnLeave = async function(startDate, endDate) {
  return await this.find({
    status: 'APPROVED',
    $or: [
      { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
    ]
  }).populate('staffId', 'name specialization department role');
};

// Method to check if leave overlaps with existing leave
leaveSchema.methods.hasOverlap = async function() {
  const overlappingLeave = await this.constructor.findOne({
    staffId: this.staffId,
    _id: { $ne: this._id },
    status: { $in: ['PENDING', 'APPROVED'] },
    $or: [
      { startDate: { $lte: this.endDate }, endDate: { $gte: this.startDate } }
    ]
  });
  
  return !!overlappingLeave;
};

// Pre-save middleware to validate dates
leaveSchema.pre('save', function(next) {
  if (this.startDate >= this.endDate) {
    return next(new Error('End date must be after start date'));
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  console.log('Date validation - Start date:', this.startDate);
  console.log('Date validation - Today:', today);
  console.log('Date validation - Comparison result:', this.startDate < today);
  
  if (this.startDate < today) {
    console.log('ERROR: Start date is in the past');
    return next(new Error('Start date cannot be in the past'));
  }
  
  next();
});

module.exports = mongoose.model('Leave', leaveSchema);
