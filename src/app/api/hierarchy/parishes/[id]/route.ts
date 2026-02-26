import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Parish from '@/lib/models/Parish';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const parish = await Parish.findById(id)
      .populate('area')
      .populate('zone')
      .lean();

    if (!parish) {
      return NextResponse.json(
        { error: 'Parish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parish);
  } catch (error) {
    console.error('GET /api/hierarchy/parishes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parish' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const parish = await Parish.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!parish) {
      return NextResponse.json(
        { error: 'Parish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(parish);
  } catch (error) {
    console.error('PUT /api/hierarchy/parishes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update parish' },
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

    const parish = await Parish.findByIdAndDelete(id).lean();

    if (!parish) {
      return NextResponse.json(
        { error: 'Parish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Parish deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/hierarchy/parishes/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete parish' },
      { status: 500 }
    );
  }
}
