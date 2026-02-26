import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Sermon from '@/lib/models/Sermon';
import SermonPurchase from '@/lib/models/SermonPurchase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const sermon = await Sermon.findById(id);
    if (!sermon) return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    if (!sermon.isPaid) return NextResponse.json({ error: 'This sermon is free' }, { status: 400 });

    const body = await request.json();
    const { buyerName, buyerEmail, buyerPhone, amount, paymentProofUrl } = body;

    if (!buyerName || !buyerEmail) {
      return NextResponse.json({ error: 'Buyer name and email are required' }, { status: 400 });
    }

    // Check for existing pending purchase
    const existing = await SermonPurchase.findOne({
      sermon: id,
      buyerEmail,
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) {
      if (existing.status === 'approved') {
        return NextResponse.json({ message: 'You already have access', accessGranted: true });
      }
      return NextResponse.json({ message: 'Payment verification pending', status: 'pending' });
    }

    const purchase = await SermonPurchase.create({
      sermon: id,
      buyerName,
      buyerEmail,
      buyerPhone: buyerPhone || '',
      amount: amount || sermon.price,
      paymentProofUrl: paymentProofUrl || '',
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('POST /api/sermons/[id]/purchase error:', error);
    return NextResponse.json({ error: 'Failed to initiate purchase' }, { status: 500 });
  }
}
