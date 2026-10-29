import mongoose from 'mongoose';

const auditEventSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Grievance',
      required: [true, 'Grievance reference is required'],
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Actor reference is required'],
    },
    actorRole: {
      type: String,
      enum: ['STUDENT', 'STAFF'],
      required: true,
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      trim: true,
      maxlength: 100,
    },
    statusFrom: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'ESCALATED',
      ],
      default: null,
    },
    statusTo: {
      type: String,
      enum: [
        'SUBMITTED',
        'UNDER_REVIEW',
        'ASSIGNED',
        'IN_PROGRESS',
        'RESOLVED',
        'ESCALATED',
      ],
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    previousHash: {
      type: String,
      default: null,
    },
    currentHash: {
      type: String,
      required: [true, 'Current hash is required'],
    },
  },
  { timestamps: true }
);

auditEventSchema.index({ grievanceId: 1 });
auditEventSchema.index({ actorId: 1 });
auditEventSchema.index({ createdAt: -1 });

const AuditEvent = mongoose.models.AuditEvent || mongoose.model('AuditEvent', auditEventSchema);

export default AuditEvent;