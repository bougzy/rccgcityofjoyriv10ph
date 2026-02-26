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
    const format = searchParams.get('format') || 'csv';

    const filter: Record<string, unknown> = {};
    if (level) filter.level = level;
    if (entityId) filter.entityId = entityId;

    const reports = await GrowthReport.find(filter).sort('-period').lean();

    if (format === 'csv') {
      const headers = [
        'Period', 'Entity', 'Sunday Attendance', 'Midweek Attendance',
        'New Converts', 'Baptisms', 'Outreach Activities',
        'House Fellowships', 'HF Attendance', 'First Timers',
        'Retention %', 'Total Members', 'Active Members',
      ];

      const rows = reports.map((r) => [
        r.period, r.entityName, r.sundayAttendance, r.midweekAttendance,
        r.newConverts, r.baptisms, r.outreachActivities,
        r.houseFellowshipCount, r.houseFellowshipAttendance, r.firstTimers,
        r.firstTimerRetention, r.totalMembers, r.activeMembers,
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="growth_report.csv"',
        },
      });
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('GET /api/growth-reports/export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
