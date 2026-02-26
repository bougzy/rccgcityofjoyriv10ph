import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SermonPurchase from '@/lib/models/SermonPurchase';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const purchases = await SermonPurchase.find(filter)
      .populate('sermon', 'title preacher price')
      .sort('-createdAt')
      .lean();

    return NextResponse.json(purchases);
  } catch (error) {
    console.error('GET /api/sermons/purchases error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();

    const { purchaseId, action } = await request.json();
    if (!purchaseId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'purchaseId and action (approve/reject) required' }, { status: 400 });
    }

    const purchase = await SermonPurchase.findByIdAndUpdate(
      purchaseId,
      {
        status: action === 'approve' ? 'approved' : 'rejected',
        accessGranted: action === 'approve',
        verifiedBy: user.id,
        verifiedAt: new Date(),
      },
      { new: true }
    ).populate('sermon', 'title preacher');

    if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error('PUT /api/sermons/purchases error:', error);
    return NextResponse.json({ error: 'Failed to update purchase' }, { status: 500 });
  }
}
