const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  serviceDate: {
    type: Date,
    default: Date.now
  },
  services: [{
    name: String,
    cost: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'insurance', 'medical_aid'],
    required: false
  },
  paidDate: {
    type: Date,
    default: null
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-generate bill number
billSchema.pre('save', async function(next) {
  if (!this.billNumber) {
    const count = await mongoose.model('Bill').countDocuments();
    this.billNumber = `BILL-${Date.now()}-${count + 1}`;
  }
  
  // Update balance
  this.balance = this.amount - this.paidAmount;
  
  // Update status based on payment
  if (this.paidAmount >= this.amount) {
    this.status = 'paid';
  } else if (this.dueDate < new Date() && this.status === 'pending') {
    this.status = 'overdue';
  }
  
  next();
});

module.exports = mongoose.model('Bill', billSchema);
