import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connect } from '@/lib/db.js';
import { getSessionUser } from '@/lib/auth.js';
import Grievance from '@/models/Grievance.js';
import User from '@/models/User.js';

const VALID_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'ESCALATED',
];
const VALID_CATEGORIES = ['hostel', 'mess', 'academics', 'facilities', 'other'];

export async function GET(req) {
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

    await connect();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)), 100);
    const search = (url.searchParams.get('search') || '').trim();
    const statusFilter = (url.searchParams.get('status') || '').trim().toUpperCase();
    const categoryFilter = (url.searchParams.get('category') || '').trim().toLowerCase();
    const assignedFilter = (url.searchParams.get('assigned') || '').trim().toLowerCase();
    const sortParam = (url.searchParams.get('sort') || 'newest').trim().toLowerCase();

    const query = {};

    if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
      query.status = statusFilter;
    }
    if (categoryFilter && VALID_CATEGORIES.includes(categoryFilter)) {
      query.category = categoryFilter;
    }
    if (assignedFilter === 'unassigned') {
      query.assignedTo = null;
    } else if (assignedFilter === 'assigned') {
      query.assignedTo = { $ne: null };
    } else if (assignedFilter === 'me') {
      query.assignedTo = new mongoose.Types.ObjectId(user.id);
    }

    if (search) {
      if (mongoose.Types.ObjectId.isValid(search)) {
        query.$or = [{ _id: search }, { title: { $regex: search, $options: 'i' } }];
      } else {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }
    }

    const sortOption = sortParam === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [grievances, total, statsAggregation] = await Promise.all([
      Grievance.find(query)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('studentId', 'name email')
        .populate('assignedTo', 'name email')
        .lean(),
      Grievance.countDocuments(query),
      Grievance.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statsMap = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      ASSIGNED: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      ESCALATED: 0,
    };

    let grandTotal = 0;
    statsAggregation.forEach((s) => {
      if (statsMap[s._id] !== undefined) {
        statsMap[s._id] = s.count;
      }
      grandTotal += s.count;
    });

    const unassignedCount = await Grievance.countDocuments({ assignedTo: null });

    const items = grievances.map((g) => ({
      id: g._id.toString(),
      title: g.title,
      description: g.description,
      category: g.category,
      status: g.status,
      version: g.version,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      student: g.studentId
        ? {
            id: g.studentId._id ? g.studentId._id.toString() : g.studentId.toString(),
            name: g.studentId.name || 'Unknown',
            email: g.studentId.email || '',
          }
        : null,
      assignedTo: g.assignedTo
        ? {
            id: g.assignedTo._id ? g.assignedTo._id.toString() : g.assignedTo.toString(),
            name: g.assignedTo.name || 'Unknown Staff',
            email: g.assignedTo.email || '',
          }
        : null,
    }));

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      stats: {
        grandTotal,
        submitted: statsMap.SUBMITTED,
        underReview: statsMap.UNDER_REVIEW,
        assigned: statsMap.ASSIGNED,
        inProgress: statsMap.IN_PROGRESS,
        resolved: statsMap.RESOLVED,
        escalated: statsMap.ESCALATED,
        unassigned: unassignedCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Service unavailable' },
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
