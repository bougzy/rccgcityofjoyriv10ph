import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/lib/models/Attendance';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const serviceType = searchParams.get('serviceType');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sort = searchParams.get('sort') || '-date';

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (level) {
      filter.level = level;
    }

    if (entityId) {
      filter.entityId = entityId;
    }

    if (serviceType) {
      filter.serviceType = serviceType;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }

    // Parse sort string
    const sortObj: Record<string, 1 | -1> = {};
    const sortFields = sort.split(',');
    for (const field of sortFields) {
      if (field.startsWith('-')) {
        sortObj[field.substring(1)] = -1;
      } else {
        sortObj[field] = 1;
      }
    }

    const records = await Attendance.find(filter)
      .sort(sortObj)
      .limit(limit)
      .lean();

    return NextResponse.json(records);
  } catch (error) {
    console.error('GET /api/attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attendance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // Auto-calculate grandTotal
    const totalMen = Number(body.totalMen) || 0;
    const totalWomen = Number(body.totalWomen) || 0;
    const totalChildren = Number(body.totalChildren) || 0;
    const totalYouth = Number(body.totalYouth) || 0;
    const totalWorkers = Number(body.totalWorkers) || 0;

    body.grandTotal = totalMen + totalWomen + totalChildren + totalYouth + totalWorkers;

    const record = await Attendance.create(body);

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('POST /api/attendance error:', error);
    return NextResponse.json(
      { error: 'Failed to create attendance record' },
      { status: 500 }
    );
  }
}
