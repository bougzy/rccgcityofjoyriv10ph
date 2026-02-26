import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GrowthReport from '@/lib/models/GrowthReport';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const periodType = searchParams.get('periodType');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const filter: Record<string, unknown> = {};
    if (level) filter.level = level;
    if (entityId) filter.entityId = entityId;
    if (periodType) filter.periodType = periodType;

    const reports = await GrowthReport.find(filter)
      .sort('-period')
      .limit(limit)
      .lean();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('GET /api/growth-reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch growth reports' }, { status: 500 });
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

    if (!body.period || !body.entityId || !body.level) {
      return NextResponse.json({ error: 'Period, entityId, and level are required' }, { status: 400 });
    }

    // Upsert — update if same period/entity already exists
    const report = await GrowthReport.findOneAndUpdate(
      { level: body.level, entityId: body.entityId, period: body.period },
      { ...body, submittedBy: user.id },
      { upsert: true, new: true }
    );

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('POST /api/growth-reports error:', error);
    return NextResponse.json({ error: 'Failed to save growth report' }, { status: 500 });
  }
}
