import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NaturalGroup from '@/lib/models/NaturalGroup';
import { getSessionUser, hasMinimumRole, canAccessScope } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const group = await NaturalGroup.findById(id)
      .populate('parish', 'name code')
      .lean();

    if (!group) {
      return NextResponse.json({ error: 'Natural group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error: unknown) {
    console.error('GET /api/natural-groups/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch natural group' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'group-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;

    const group = await NaturalGroup.findById(id);
    if (!group) {
      return NextResponse.json({ error: 'Natural group not found' }, { status: 404 });
    }

    // Check scope access
    if (user.role !== 'super-admin') {
      const hasAccess = await canAccessScope(
        user.scopeType || '',
        user.scopeId || '',
        'group',
        id
      );
      if (!hasAccess) {
        return NextResponse.json({ error: 'You do not have access to this group' }, { status: 403 });
      }
    }

    const body = await request.json();
    const updated = await NaturalGroup.findByIdAndUpdate(id, body, { new: true })
      .populate('parish', 'name code')
      .lean();

    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error('PUT /api/natural-groups/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update natural group' }, { status: 500 });
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

    const group = await NaturalGroup.findById(id);
    if (!group) {
      return NextResponse.json({ error: 'Natural group not found' }, { status: 404 });
    }

    // Check scope access
    if (user.role !== 'super-admin') {
      const hasAccess = await canAccessScope(
        user.scopeType || '',
        user.scopeId || '',
        'parish',
        group.parish.toString()
      );
      if (!hasAccess) {
        return NextResponse.json({ error: 'You do not have access to this parish' }, { status: 403 });
      }
    }

    await NaturalGroup.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Natural group deleted successfully' });
  } catch (error: unknown) {
    console.error('DELETE /api/natural-groups/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete natural group' }, { status: 500 });
  }
}
