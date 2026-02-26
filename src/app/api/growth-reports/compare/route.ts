import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import GrowthReport from '@/lib/models/GrowthReport';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'zone-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'parish';
    const period = searchParams.get('period');
    const parentId = searchParams.get('parentId');

    if (!period) {
      return NextResponse.json({ error: 'Period is required' }, { status: 400 });
    }

    const filter: Record<string, unknown> = { level, period };

    // Filter by parent hierarchy
    if (parentId) {
      if (level === 'parish') filter.area = parentId;
      else if (level === 'area') filter.zone = parentId;
      else if (level === 'zone') filter.province = parentId;
    }

    const reports = await GrowthReport.find(filter)
      .sort('-sundayAttendance')
      .lean();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('GET /api/growth-reports/compare error:', error);
    return NextResponse.json({ error: 'Failed to fetch comparison' }, { status: 500 });
  }
}
