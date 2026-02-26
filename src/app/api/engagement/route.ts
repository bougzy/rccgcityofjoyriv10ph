import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EngagementScore from '@/lib/models/EngagementScore';
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
    const classification = searchParams.get('classification');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const sort = searchParams.get('sort') || '-overallScore';

    const filter: Record<string, unknown> = {};
    if (parish) filter.parish = parish;
    if (classification) filter.classification = classification;

    const scores = await EngagementScore.find(filter)
      .populate('parish', 'name')
      .sort(sort)
      .limit(limit)
      .lean();

    return NextResponse.json(scores);
  } catch (error) {
    console.error('GET /api/engagement error:', error);
    return NextResponse.json({ error: 'Failed to fetch engagement scores' }, { status: 500 });
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

    if (!body.memberName || !body.parish) {
      return NextResponse.json({ error: 'Member name and parish are required' }, { status: 400 });
    }

    // Calculate overall score (weighted average)
    const overall = Math.round(
      (body.attendanceScore || 0) * 0.35 +
      (body.participationScore || 0) * 0.25 +
      (body.volunteerScore || 0) * 0.2 +
      (body.evangelismScore || 0) * 0.2
    );

    // Classify
    let classification = 'inactive';
    if (overall >= 80) classification = 'highly-active';
    else if (overall >= 60) classification = 'active';
    else if (overall >= 30) classification = 'at-risk';

    const score = await EngagementScore.create({
      ...body,
      overallScore: overall,
      classification,
      lastCalculated: new Date(),
    });

    return NextResponse.json(score, { status: 201 });
  } catch (error) {
    console.error('POST /api/engagement error:', error);
    return NextResponse.json({ error: 'Failed to create engagement score' }, { status: 500 });
  }
}
