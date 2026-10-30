import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Grievance from '@/models/Grievance.js';
import AuditEvent from '@/models/AuditEvent.js';
import User from '@/models/User.js';
import Notification from '@/models/Notification.js';
import { buildEventPayload, computeEventHash } from '@/lib/audit.js';

export async function PATCH(req, { params }) {
  try {
    const sessionResult = await getSessionUser(req);
    if (sessionResult.error) {
      return NextResponse.json({ error: sessionResult.error }, { status: sessionResult.status });
    }
    const user = sessionResult.user;
    if (user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const grievanceId = params.id;
    if (!grievanceId || !mongoose.Types.ObjectId.isValid(grievanceId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { assignedTo, version } = body;

    const conn = await connect();

    let targetStaff = null;
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return NextResponse.json({ error: 'Invalid staff user ID' }, { status: 400 });
      }
      targetStaff = await User.findById(assignedTo).lean();
      if (!targetStaff || targetStaff.role !== 'STAFF') {
        return NextResponse.json({ error: 'Target assigned user must be a staff member' }, { status: 400 });
      }
    }

    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (version !== undefined && typeof version === 'number' && grievance.version !== version) {
      return NextResponse.json(
        { error: 'Grievance has been modified by another user. Please refresh and try again.' },
        { status: 409 }
      );
    }

    let newStatus = grievance.status;
    if (assignedTo && (grievance.status === 'SUBMITTED' || grievance.status === 'UNDER_REVIEW')) {
      newStatus = 'ASSIGNED';
    }

    const lastAudit = await AuditEvent.findOne({ grievanceId }).sort({ createdAt: -1 }).lean();
    const previousHash = lastAudit ? lastAudit.currentHash : null;

    const eventType = assignedTo ? 'grievance_assigned' : 'grievance_unassigned';
    const metadata = {
      assignedTo: assignedTo ? assignedTo.toString() : null,
      previousAssignedTo: grievance.assignedTo ? grievance.assignedTo.toString() : null,
      staffName: targetStaff ? targetStaff.name : null,
    };

    const eventPayload = buildEventPayload({
      eventType,
      actorId: user.id,
      actorRole: 'STAFF',
      grievanceId,
      statusFrom: grievance.status,
      statusTo: newStatus,
      metadata,
    });

    const currentHash = computeEventHash(eventPayload);

    let mSession = null;
    let txStarted = false;
    try {
      const s = conn.startSession();
      s.startTransaction();
      mSession = s;
      txStarted = true;
    } catch {
      mSession = null;
    }

    try {
      grievance.assignedTo = assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null;
      grievance.status = newStatus;
      grievance.version = (grievance.version || 1) + 1;

      const opts = mSession ? { session: mSession } : {};

      if (mSession) {
        await grievance.save(opts);
        await AuditEvent.create([{
          grievanceId,
          actorId: new mongoose.Types.ObjectId(user.id),
          actorRole: 'STAFF',
          eventType,
          statusFrom: eventPayload.statusFrom,
          statusTo: eventPayload.statusTo,
          metadata,
          previousHash,
          currentHash,
        }], opts);
        await Notification.create([{
          userId: grievance.studentId,
          type: 'GRIEVANCE_ASSIGNED',
          grievanceId,
          title: 'Grievance Assignment Update',
          body: assignedTo
            ? `Your grievance "${grievance.title}" has been assigned to ${targetStaff ? targetStaff.name : 'a staff member'}.`
            : `Your grievance "${grievance.title}" assignment has been updated.`,
        }], opts);
        if (txStarted) await conn.commitTransaction();
      } else {
        await grievance.save();
        await AuditEvent.create({
          grievanceId,
          actorId: new mongoose.Types.ObjectId(user.id),
          actorRole: 'STAFF',
          eventType,
          statusFrom: eventPayload.statusFrom,
          statusTo: eventPayload.statusTo,
          metadata,
          previousHash,
          currentHash,
        });
        await Notification.create({
          userId: grievance.studentId,
          type: 'GRIEVANCE_ASSIGNED',
          grievanceId,
          title: 'Grievance Assignment Update',
          body: assignedTo
            ? `Your grievance "${grievance.title}" has been assigned to ${targetStaff ? targetStaff.name : 'a staff member'}.`
            : `Your grievance "${grievance.title}" assignment has been updated.`,
        });
      }

      return NextResponse.json({
        id: grievance._id.toString(),
        status: grievance.status,
        version: grievance.version,
        assignedTo: targetStaff ? { id: targetStaff._id.toString(), name: targetStaff.name, email: targetStaff.email } : null,
      });
    } catch {
      if (txStarted) { try { await conn.abortTransaction(); } catch {} }
      return NextResponse.json({ error: 'Failed to assign grievance' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}
