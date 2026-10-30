import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Grievance from '@/models/Grievance.js';
import AuditEvent from '@/models/AuditEvent.js';
import User from '@/models/User.js';
import { verifyAuditChain } from '@/lib/audit.js';

export async function GET(req, { params }) {
  try {
    const sessionResult = await getSessionUser(req);
    if (sessionResult.error) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: sessionResult.status }
      );
    }
    const user = sessionResult.user;
    if (user.role !== 'STAFF') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const grievanceId = params.id;
    if (!grievanceId || !mongoose.Types.ObjectId.isValid(grievanceId)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await connect();

    const grievance = await Grievance.findById(grievanceId)
      .populate('studentId', 'name email')
      .populate('assignedTo', 'name email')
      .lean();

    if (!grievance) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const rawAuditEvents = await AuditEvent.find({ grievanceId })
      .sort({ createdAt: 1 })
      .populate('actorId', 'name email role')
      .lean();

    const auditIntegrity = verifyAuditChain(rawAuditEvents);

    const formattedEvents = rawAuditEvents.map((evt) => ({
      id: evt._id.toString(),
      eventType: evt.eventType,
      actorRole: evt.actorRole,
      actor: evt.actorId
        ? {
            id: evt.actorId._id ? evt.actorId._id.toString() : evt.actorId.toString(),
            name: evt.actorId.name || 'System User',
            email: evt.actorId.email || '',
            role: evt.actorId.role || evt.actorRole,
          }
        : null,
      statusFrom: evt.statusFrom,
      statusTo: evt.statusTo,
      metadata: evt.metadata,
      previousHash: evt.previousHash,
      currentHash: evt.currentHash,
      createdAt: evt.createdAt,
    }));

    const formattedGrievance = {
      id: grievance._id.toString(),
      title: grievance.title,
      description: grievance.description,
      category: grievance.category,
      status: grievance.status,
      version: grievance.version || 1,
      createdAt: grievance.createdAt,
      updatedAt: grievance.updatedAt,
      student: grievance.studentId
        ? {
            id: grievance.studentId._id ? grievance.studentId._id.toString() : grievance.studentId.toString(),
            name: grievance.studentId.name || 'Unknown Student',
            email: grievance.studentId.email || '',
          }
        : null,
      assignedTo: grievance.assignedTo
        ? {
            id: grievance.assignedTo._id ? grievance.assignedTo._id.toString() : grievance.assignedTo.toString(),
            name: grievance.assignedTo.name || 'Unknown Staff',
            email: grievance.assignedTo.email || '',
          }
        : null,
    };

    return NextResponse.json({
      grievance: formattedGrievance,
      auditEvents: formattedEvents,
      auditIntegrity,
    });
  } catch {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
