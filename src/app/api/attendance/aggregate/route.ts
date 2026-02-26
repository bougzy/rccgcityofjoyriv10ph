import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Attendance from '@/lib/models/Attendance';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Ensure model is registered
    void Attendance;

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const groupBy = searchParams.get('groupBy') || 'month';

    // Build match stage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const matchStage: Record<string, any> = {};

    if (level) {
      matchStage.level = level;
    }

    if (entityId) {
      matchStage.entityId = new mongoose.Types.ObjectId(entityId);
    }

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) {
        matchStage.date.$gte = new Date(startDate);
      }
      if (endDate) {
        matchStage.date.$lte = new Date(endDate);
      }
    }

    // Build group stage based on groupBy parameter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let groupId: any;

    switch (groupBy) {
      case 'week':
        groupId = {
          year: { $isoWeekYear: '$date' },
          week: { $isoWeek: '$date' },
        };
        break;
      case 'serviceType':
        groupId = '$serviceType';
        break;
      case 'month':
      default:
        groupId = {
          year: { $year: '$date' },
          month: { $month: '$date' },
        };
        break;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          totalAttendance: { $sum: '$grandTotal' },
          count: { $sum: 1 },
          avgAttendance: { $avg: '$grandTotal' },
        },
      },
      { $sort: { _id: 1 as const } },
    ];

    const results = await Attendance.aggregate(pipeline);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET /api/attendance/aggregate error:', error);
    return NextResponse.json(
      { error: 'Failed to aggregate attendance data' },
      { status: 500 }
    );
  }
}
