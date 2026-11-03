import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Grievance from '@/models/Grievance.js';
import AuditEvent from '@/models/AuditEvent.js';
import Notification from '@/models/Notification.js';
import { buildEventPayload, computeEventHash } from '@/lib/audit.js';

const ALLOWED = {
  SUBMITTED: ['UNDER_REVIEW', 'ASSIGNED', 'ESCALATED'],
  UNDER_REVIEW: ['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'],
  ASSIGNED: ['IN_PROGRESS', 'RESOLVED', 'ESCALATED', 'UNDER_REVIEW'],
  IN_PROGRESS: ['RESOLVED', 'ESCALATED', 'UNDER_REVIEW'],
  ESCALATED: ['UNDER_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'],
  // RESOLVED has no transitions in MVP - grievances remain closed
};

export async function PATCH(req, { params }) {
  try {
    const sRes = await getSessionUser(req);
    if (sRes.error) return NextResponse.json({ error: sRes.error }, { status: sRes.status });
    if (sRes.user.role !== 'STAFF') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const grievanceId = params.id;
    if (!grievanceId || !mongoose.Types.ObjectId.isValid(grievanceId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { status, resolutionNote, version } = body;
    const targetStatus = typeof status === 'string' ? status.trim().toUpperCase() : '';
    const trimmedNote = typeof resolutionNote === 'string' ? resolutionNote.trim() : '';

    if (!ALLOWED[targetStatus] && targetStatus !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Invalid target status' }, { status: 400 });
    }

    const conn = await connect();
    const grievance = await Grievance.findById(grievanceId);
    if (!grievance) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (version !== undefined && typeof version === 'number' && grievance.version !== version) {
      return NextResponse.json(
        { error: 'Grievance was modified by another user. Please refresh and try again.' },
        { status: 409 }
      );
    }

    if (grievance.status === targetStatus) {
      return NextResponse.json({ error: `Grievance is already in status ${targetStatus}` }, { status: 400 });
    }

    const validNext = ALLOWED[grievance.status] || [];
    if (!validNext.includes(targetStatus)) {
      if (grievance.status === 'RESOLVED') {
        return NextResponse.json(
          { error: `Resolved grievances cannot transition to ${targetStatus}. In this MVP, resolved grievances remain closed.` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Invalid status transition from ${grievance.status} to ${targetStatus}` },
        { status: 400 }
      );
    }

    if (targetStatus === 'RESOLVED' && trimmedNote.length < 5) {
      return NextResponse.json(
        { error: 'A detailed resolution note (at least 5 characters) is required when marking a grievance as RESOLVED.' },
        { status: 400 }
      );
    }

    const lastAudit = await AuditEvent.findOne({ grievanceId }).sort({ createdAt: -1 }).lean();
    const previousHash = lastAudit ? lastAudit.currentHash : null;
    const metadata = { resolutionNote: trimmedNote || null, previousStatus: grievance.status };

    const eventPayload = buildEventPayload({
      eventType: 'status_changed',
      actorId: sRes.user.id,
      actorRole: 'STAFF',
      grievanceId,
      statusFrom: grievance.status,
      statusTo: targetStatus,
      metadata,
    });

    const currentHash = computeEventHash(eventPayload);

    let mSession = null, txStarted = false;
    try {
      const s = conn.startSession();
      s.startTransaction();
      mSession = s;
      txStarted = true;
    } catch {
      mSession = null;
    }

    try {
      grievance.status = targetStatus;
      grievance.version = (grievance.version || 1) + 1;

      if (mSession) {
        await grievance.save({ session: mSession });
        await AuditEvent.create([{
          grievanceId, actorId: new mongoose.Types.ObjectId(sRes.user.id), actorRole: 'STAFF',
          eventType: 'status_changed', statusFrom: eventPayload.statusFrom, statusTo: eventPayload.statusTo,
          metadata, previousHash, currentHash,
        }], { session: mSession });
        await Notification.create([{
          userId: grievance.studentId, type: 'GRIEVANCE_STATUS_CHANGED', grievanceId,
          title: 'Grievance Status Updated',
          body: `Your grievance "${grievance.title}" status changed to ${targetStatus}.${trimmedNote ? ` Note: ${trimmedNote}` : ''}`,
        }], { session: mSession });
        if (txStarted) await mSession.commitTransaction();
      } else {
        await grievance.save();
        await AuditEvent.create({
          grievanceId, actorId: new mongoose.Types.ObjectId(sRes.user.id), actorRole: 'STAFF',
          eventType: 'status_changed', statusFrom: eventPayload.statusFrom, statusTo: eventPayload.statusTo,
          metadata, previousHash, currentHash,
        });
        await Notification.create({
          userId: grievance.studentId, type: 'GRIEVANCE_STATUS_CHANGED', grievanceId,
          title: 'Grievance Status Updated',
          body: `Your grievance "${grievance.title}" status changed to ${targetStatus}.${trimmedNote ? ` Note: ${trimmedNote}` : ''}`,
        });
      }

      return NextResponse.json({ id: grievance._id.toString(), status: grievance.status, version: grievance.version });
    } catch {
      if (txStarted) { try { await mSession.abortTransaction(); } catch {} }
      return NextResponse.json({ error: 'Failed to update grievance status' }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}
