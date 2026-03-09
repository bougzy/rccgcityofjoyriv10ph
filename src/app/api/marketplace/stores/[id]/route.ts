import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MarketplaceStore from '@/lib/models/MarketplaceStore';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const store = await MarketplaceStore.findById(params.id);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    return NextResponse.json(store);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch store' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const userRole = (session.user as { role?: string }).role;

    const store = await MarketplaceStore.findById(params.id);
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

    // Super admin can approve/reject and update anything
    if (userRole === 'super-admin') {
      if (body.status === 'approved') {
        body.approvedBy = (session.user as { id?: string }).id;
        body.approvedAt = new Date();
      }
      Object.assign(store, body);
      await store.save();
      return NextResponse.json(store);
    }

    // Store owner can only update their own store details (not status)
    if (store.ownerEmail === session.user.email) {
      const allowedFields = ['storeName', 'description', 'whatsappNumber', 'logoUrl', 'bannerUrl', 'setupFeeProof'];
      const update: Record<string, unknown> = {};
      for (const field of allowedFields) {
        if (body[field] !== undefined) update[field] = body[field];
      }
      Object.assign(store, update);
      await store.save();
      return NextResponse.json(store);
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Failed to update store' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as { role?: string })?.role;
    if (userRole !== 'super-admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await dbConnect();
    await MarketplaceStore.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete store' }, { status: 500 });
  }
}