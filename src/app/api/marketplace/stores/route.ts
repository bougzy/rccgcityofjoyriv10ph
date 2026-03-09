import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MarketplaceStore from '@/lib/models/MarketplaceStore';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const myStores = searchParams.get('myStores');

    const session = await getServerSession(authOptions);

    const query: Record<string, unknown> = {};

    if (myStores && session?.user) {
      query.ownerEmail = session.user.email;
    } else if (status) {
      query.status = status;
    } else {
      // Public: only approved stores
      query.status = 'approved';
      query.isActive = true;
    }

    const stores = await MarketplaceStore.find(query).sort({ createdAt: -1 });
    return NextResponse.json(stores);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stores' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const existing = await MarketplaceStore.findOne({ ownerEmail: session.user.email, status: { $in: ['pending', 'approved'] } });
    if (existing) {
      return NextResponse.json({ error: 'You already have an active store application' }, { status: 400 });
    }

    const store = await MarketplaceStore.create({
      ...body,
      ownerId: (session.user as { id?: string }).id,
      ownerName: session.user.name,
      ownerEmail: session.user.email,
      status: 'pending',
      setupFeePaid: false,
    });

    return NextResponse.json(store, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create store application' }, { status: 500 });
  }
}