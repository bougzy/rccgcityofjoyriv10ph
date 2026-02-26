import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VolunteerProfile from '@/lib/models/VolunteerProfile';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const parish = searchParams.get('parish');
    const skill = searchParams.get('skill');
    const availability = searchParams.get('availability');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const filter: Record<string, unknown> = { isActive: true };
    if (parish) filter.parish = parish;
    if (skill) filter.skills = skill;
    if (availability) filter.availability = availability;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const volunteers = await VolunteerProfile.find(filter)
      .populate('parish', 'name')
      .populate('naturalGroups', 'name')
      .sort('-createdAt')
      .limit(limit)
      .lean();

    return NextResponse.json(volunteers);
  } catch (error) {
    console.error('GET /api/volunteers error:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    if (!body.name || !body.parish) {
      return NextResponse.json({ error: 'Name and parish are required' }, { status: 400 });
    }

    const volunteer = await VolunteerProfile.create(body);
    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error('POST /api/volunteers error:', error);
    return NextResponse.json({ error: 'Failed to create volunteer' }, { status: 500 });
  }
}
