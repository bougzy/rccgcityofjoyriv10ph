import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Convert from '@/lib/models/Convert';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const convert = await Convert.findById(id).populate('parish', 'name').lean();
    if (!convert) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(convert);
  } catch (error) {
    console.error('GET /api/converts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch convert' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const convert = await Convert.findById(id);
    if (!convert) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // If stage is being advanced, add to history
    if (body.stage && body.stage !== convert.stage) {
      convert.stageHistory.push({
        stage: body.stage,
        enteredAt: new Date(),
        notes: body.stageNotes || `Advanced to ${body.stage}`,
        updatedBy: user.id,
      });
      convert.stage = body.stage;
    }

    // Update other fields
    const updateFields = ['fullName', 'phone', 'email', 'address', 'age', 'gender',
      'invitedBy', 'houseFellowship', 'discipleshipClass', 'baptismDate',
      'integratedGroup', 'notes', 'isActive'];

    for (const field of updateFields) {
      if (body[field] !== undefined) {
        (convert as Record<string, unknown>)[field] = body[field];
      }
    }

    await convert.save();

    return NextResponse.json(convert);
  } catch (error) {
    console.error('PUT /api/converts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update convert' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const convert = await Convert.findByIdAndDelete(id);
    if (!convert) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Convert record deleted' });
  } catch (error) {
    console.error('DELETE /api/converts/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete convert' }, { status: 500 });
  }
}
