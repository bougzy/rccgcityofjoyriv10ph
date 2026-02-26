import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Attendance from '@/lib/models/Attendance';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // Recalculate grandTotal if attendance numbers are provided
    if (
      body.totalMen !== undefined ||
      body.totalWomen !== undefined ||
      body.totalChildren !== undefined ||
      body.totalYouth !== undefined ||
      body.totalWorkers !== undefined
    ) {
      const totalMen = Number(body.totalMen) || 0;
      const totalWomen = Number(body.totalWomen) || 0;
      const totalChildren = Number(body.totalChildren) || 0;
      const totalYouth = Number(body.totalYouth) || 0;
      const totalWorkers = Number(body.totalWorkers) || 0;
      body.grandTotal = totalMen + totalWomen + totalChildren + totalYouth + totalWorkers;
    }

    const record = await Attendance.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!record) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(record);
  } catch (error) {
    console.error('PUT /api/attendance/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update attendance record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const record = await Attendance.findByIdAndDelete(id).lean();

    if (!record) {
      return NextResponse.json(
        { error: 'Attendance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/attendance/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete attendance record' },
      { status: 500 }
    );
  }
}
