import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EngagementScore from '@/lib/models/EngagementScore';
import Attendance from '@/lib/models/Attendance';
import EventAttendance from '@/lib/models/EventAttendance';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { parishId } = await request.json();

    if (!parishId) {
      return NextResponse.json({ error: 'parishId is required' }, { status: 400 });
    }

    // Get all engagement scores for this parish
    const scores = await EngagementScore.find({ parish: parishId });

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    // Get attendance data for the parish in last 3 months
    const serviceCount = await Attendance.countDocuments({
      parish: parishId,
      date: { $gte: threeMonthsAgo },
    });

    let updated = 0;

    for (const score of scores) {
      // Count event attendance for this member
      const eventAttendance = await EventAttendance.countDocuments({
        'email': score.memberEmail,
        checkInTime: { $gte: threeMonthsAgo },
      });

      // Calculate attendance score (% of services attended, normalized to 100)
      const attendanceScore = serviceCount > 0
        ? Math.min(100, Math.round((eventAttendance / Math.max(serviceCount, 1)) * 100))
        : score.attendanceScore;

      // Calculate overall
      const overall = Math.round(
        attendanceScore * 0.35 +
        score.participationScore * 0.25 +
        score.volunteerScore * 0.2 +
        score.evangelismScore * 0.2
      );

      let classification = 'inactive';
      if (overall >= 80) classification = 'highly-active';
      else if (overall >= 60) classification = 'active';
      else if (overall >= 30) classification = 'at-risk';

      // Update and add to history
      const currentMonth = new Date().toISOString().substring(0, 7);
      score.attendanceScore = attendanceScore;
      score.overallScore = overall;
      score.classification = classification;
      score.lastCalculated = new Date();

      // Add to monthly history if not already recorded this month
      const hasThisMonth = score.monthlyHistory.some((h: { month: string }) => h.month === currentMonth);
      if (!hasThisMonth) {
        score.monthlyHistory.push({ month: currentMonth, score: overall });
      }

      await score.save();
      updated++;
    }

    return NextResponse.json({ message: `Recalculated ${updated} engagement scores` });
  } catch (error) {
    console.error('POST /api/engagement/calculate error:', error);
    return NextResponse.json({ error: 'Failed to calculate scores' }, { status: 500 });
  }
}
