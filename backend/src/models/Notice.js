import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Notice description/content is required'],
      trim: true,
    },
    important: {
      type: Boolean,
      default: false, // If true, this notice gets pinned to the top
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model('Notice', noticeSchema);