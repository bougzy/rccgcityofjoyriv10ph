import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Attendance from '@/lib/models/Attendance';
import MembershipSnapshot from '@/lib/models/MembershipSnapshot';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Ensure models are registered
    void Attendance;
    void MembershipSnapshot;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const compareIds = searchParams.get('compareIds');

    if (!type) {
      return NextResponse.json(
        { error: 'Report type is required. Use: attendance-trend, growth, or comparison' },
        { status: 400 }
      );
    }

    // Build common date match filter for attendance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dateMatch: Record<string, any> = {};
    if (startDate || endDate) {
      dateMatch.date = {};
      if (startDate) {
        dateMatch.date.$gte = new Date(startDate);
      }
      if (endDate) {
        dateMatch.date.$lte = new Date(endDate);
      }
    }

    switch (type) {
      case 'attendance-trend': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchStage: Record<string, any> = { ...dateMatch };
        if (level) matchStage.level = level;
        if (entityId) matchStage.entityId = new mongoose.Types.ObjectId(entityId);

        const results = await Attendance.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
              },
              totalAttendance: { $sum: '$grandTotal' },
              avgAttendance: { $avg: '$grandTotal' },
              count: { $sum: 1 },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
          {
            $project: {
              _id: 0,
              month: {
                $concat: [
                  { $toString: '$_id.year' },
                  '-',
                  {
                    $cond: {
                      if: { $lt: ['$_id.month', 10] },
                      then: { $concat: ['0', { $toString: '$_id.month' }] },
                      else: { $toString: '$_id.month' },
                    },
                  },
                ],
              },
              totalAttendance: 1,
              avgAttendance: { $round: ['$avgAttendance', 0] },
            },
          },
        ]);

        return NextResponse.json(results);
      }

      case 'growth': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchStage: Record<string, any> = {};
        if (level) matchStage.level = level;
        if (entityId) matchStage.entityId = new mongoose.Types.ObjectId(entityId);
        if (startDate) matchStage.month = { $gte: startDate.substring(0, 7) };
        if (endDate) {
          matchStage.month = matchStage.month || {};
          matchStage.month.$lte = endDate.substring(0, 7);
        }

        const results = await MembershipSnapshot.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$month',
              totalMembers: { $sum: '$totalMembers' },
              newMembers: { $sum: '$newMembers' },
              newConverts: { $sum: '$newConverts' },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              _id: 0,
              month: '$_id',
              totalMembers: 1,
              newMembers: 1,
              newConverts: 1,
            },
          },
        ]);

        return NextResponse.json(results);
      }

      case 'comparison': {
        if (!compareIds) {
          return NextResponse.json(
            { error: 'compareIds parameter is required for comparison reports' },
            { status: 400 }
          );
        }

        const entityIds = compareIds.split(',').map(
          (id) => new mongoose.Types.ObjectId(id.trim())
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const matchStage: Record<string, any> = {
          entityId: { $in: entityIds },
          ...dateMatch,
        };
        if (level) matchStage.level = level;

        const results = await Attendance.aggregate([
          { $match: matchStage },
          {
            $group: {
              _id: '$entityId',
              entityName: { $first: '$entityName' },
              totalAttendance: { $sum: '$grandTotal' },
              count: { $sum: 1 },
              avgAttendance: { $avg: '$grandTotal' },
            },
          },
          { $sort: { totalAttendance: -1 } },
          {
            $project: {
              _id: 0,
              entityId: '$_id',
              entityName: 1,
              totalAttendance: 1,
            },
          },
        ]);

        return NextResponse.json(results);
      }

      default:
        return NextResponse.json(
          { error: `Unknown report type: ${type}. Use: attendance-trend, growth, or comparison` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
