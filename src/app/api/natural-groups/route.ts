import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import NaturalGroup from '@/lib/models/NaturalGroup';
import { getSessionUser, hasMinimumRole, canAccessScope } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const parish = searchParams.get('parish');
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');

    const filter: Record<string, unknown> = {};
    if (parish) filter.parish = parish;
    if (type) filter.type = type;
    if (isActive !== null && isActive !== '') filter.isActive = isActive === 'true';

    const groups = await NaturalGroup.find(filter)
      .populate('parish', 'name code')
      .sort('name')
      .lean();

    return NextResponse.json(groups);
  } catch (error: unknown) {
    console.error('GET /api/natural-groups error:', error);
    return NextResponse.json({ error: 'Failed to fetch natural groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    const { parish, name, slug, type, description, meetingDay, meetingTime, meetingVenue, leaderName, leaderPhone, leaderEmail } = body;

    if (!parish || !name || !slug || !type) {
      return NextResponse.json({ error: 'Parish, name, slug, and type are required' }, { status: 400 });
    }

    // Check scope access
    if (user.role !== 'super-admin') {
      const hasAccess = await canAccessScope(
        user.scopeType || '',
        user.scopeId || '',
        'parish',
        parish
      );
      if (!hasAccess) {
        return NextResponse.json({ error: 'You do not have access to this parish' }, { status: 403 });
      }
    }

    // Check if group type already exists for this parish
    const existing = await NaturalGroup.findOne({ parish, type });
    if (existing) {
      return NextResponse.json({ error: 'This group type already exists for this parish' }, { status: 400 });
    }

    const group = await NaturalGroup.create({
      parish,
      name,
      slug,
      type,
      description: description || '',
      meetingDay: meetingDay || '',
      meetingTime: meetingTime || '',
      meetingVenue: meetingVenue || '',
      leaderName: leaderName || '',
      leaderPhone: leaderPhone || '',
      leaderEmail: leaderEmail || '',
    });

    return NextResponse.json(group, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/natural-groups error:', error);
    return NextResponse.json({ error: 'Failed to create natural group' }, { status: 500 });
  }
}
