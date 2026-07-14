import mongoose from 'mongoose';
import { OVERDUE_DAYS } from '../config/constants.js';

// Define the subdocument schema for tracking audit history logs
const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
    required: true,
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the Admin or Resident who initiated the change
    required: true,
  },
  note: {
    type: String,
    trim: true,
    default: 'Complaint status initiated.',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Complaint description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Maintenance', 'Other'],
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
      default: 'OPEN',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    photo: {
      type: String,
      default: '',
    },
    statusHistory: [statusHistorySchema],
  },
  { 
    timestamps: true ,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

complaintSchema.virtual('isOverdue').get(function () {
  if (this.status === 'RESOLVED') {
    return false;
  }
  
  const today = new Date();
  const creationDate = new Date(this.createdAt);
  
  const timeDifference = today.getTime() - creationDate.getTime();
  const daysDifference = timeDifference / (1000 * 3600 * 24);
  
  return daysDifference > OVERDUE_DAYS; 
});

complaintSchema.pre('save', function () {
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({
      status: 'OPEN',
      actor: this.resident,
      note: 'Complaint filed successfully.',
    });
  }
});


export default mongoose.model('Complaint', complaintSchema);