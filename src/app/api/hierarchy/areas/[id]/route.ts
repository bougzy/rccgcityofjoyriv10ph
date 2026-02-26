import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Area from '@/lib/models/Area';
import Parish from '@/lib/models/Parish';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const area = await Area.findById(id).populate('zone').lean();

    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(area);
  } catch (error) {
    console.error('GET /api/hierarchy/areas/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch area' },
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

    const area = await Area.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(area);
  } catch (error) {
    console.error('PUT /api/hierarchy/areas/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update area' },
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

    const area = await Area.findByIdAndDelete(id).lean();

    if (!area) {
      return NextResponse.json(
        { error: 'Area not found' },
        { status: 404 }
      );
    }

    // Delete all child parishes under this area
    await Parish.deleteMany({ area: id });

    return NextResponse.json({ message: 'Area and all child parishes deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/hierarchy/areas/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete area' },
      { status: 500 }
    );
  }
}
