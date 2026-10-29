import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry is required'],
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

sessionSchema.index({ userId: 1, expiresAt: 1 });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;