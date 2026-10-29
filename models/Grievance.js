import mongoose from 'mongoose';

const grievanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student reference is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ['hostel', 'mess', 'academics', 'facilities', 'other'],
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'ESCALATED',
      ],
      default: 'SUBMITTED',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

grievanceSchema.index({ studentId: 1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ assignedTo: 1 });
grievanceSchema.index({ category: 1 });

const Grievance = mongoose.models.Grievance || mongoose.model('Grievance', grievanceSchema);

export default Grievance;