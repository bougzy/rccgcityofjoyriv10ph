import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Zone from '@/lib/models/Zone';
import Area from '@/lib/models/Area';
import Parish from '@/lib/models/Parish';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const zone = await Zone.findById(id).populate('province').lean();

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error('GET /api/hierarchy/zones/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zone' },
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

    const zone = await Zone.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error('PUT /api/hierarchy/zones/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update zone' },
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

    const zone = await Zone.findByIdAndDelete(id).lean();

    if (!zone) {
      return NextResponse.json(
        { error: 'Zone not found' },
        { status: 404 }
      );
    }

    // Delete all child areas and parishes under this zone
    await Parish.deleteMany({ zone: id });
    await Area.deleteMany({ zone: id });

    return NextResponse.json({ message: 'Zone and all child entities deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/hierarchy/zones/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete zone' },
      { status: 500 }
    );
  }
}
