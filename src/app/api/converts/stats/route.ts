import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Convert from '@/lib/models/Convert';
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

    const filter: Record<string, unknown> = { isActive: true };
    if (parish) filter.parish = parish;

    const stages = ['first-visit', 'follow-up', 'house-fellowship', 'discipleship', 'baptism', 'integrated'];
    const stageCounts: Record<string, number> = {};

    for (const stage of stages) {
      stageCounts[stage] = await Convert.countDocuments({ ...filter, stage });
    }

    const total = await Convert.countDocuments(filter);
    const integrated = stageCounts['integrated'] || 0;
    const conversionRate = total > 0 ? Math.round((integrated / total) * 100) : 0;

    // Find drop-off stages (highest count that's not integrated)
    let maxDropOff = '';
    let maxDropCount = 0;
    for (const stage of stages.slice(0, -1)) {
      if (stageCounts[stage] > maxDropCount) {
        maxDropCount = stageCounts[stage];
        maxDropOff = stage;
      }
    }

    // Average days to integrate
    const integratedConverts = await Convert.find({ ...filter, stage: 'integrated' })
      .select('firstVisitDate stageHistory')
      .lean();

    let avgDays = 0;
    if (integratedConverts.length > 0) {
      const totalDays = integratedConverts.reduce((sum, c) => {
        const lastStage = c.stageHistory[c.stageHistory.length - 1];
        const days = lastStage
          ? Math.round((new Date(lastStage.enteredAt).getTime() - new Date(c.firstVisitDate).getTime()) / (1000 * 60 * 60 * 24))
          : 0;
        return sum + days;
      }, 0);
      avgDays = Math.round(totalDays / integratedConverts.length);
    }

    return NextResponse.json({
      total,
      stageCounts,
      conversionRate,
      dropOffStage: maxDropOff,
      averageIntegrationDays: avgDays,
    });
  } catch (error) {
    console.error('GET /api/converts/stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
