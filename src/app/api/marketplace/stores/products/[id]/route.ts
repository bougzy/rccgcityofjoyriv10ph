import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MarketplaceProduct from '@/lib/models/MarketplaceProduct';
import MarketplaceStore from '@/lib/models/MarketplaceStore';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const product = await MarketplaceProduct.findByIdAndUpdate(
      params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('storeId', 'storeName whatsappNumber logoUrl status ownerName');
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();
    const product = await MarketplaceProduct.findById(params.id).populate('storeId');
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const store = product.storeId as { ownerEmail?: string };
    if (store.ownerEmail !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    Object.assign(product, body);
    await product.save();
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const product = await MarketplaceProduct.findById(params.id).populate('storeId');
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const store = product.storeId as { ownerEmail?: string; _id: string };
    const userRole = (session.user as { role?: string }).role;

    if (store.ownerEmail !== session.user.email && userRole !== 'super-admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await MarketplaceProduct.findByIdAndDelete(params.id);
    await MarketplaceStore.findByIdAndUpdate(store._id, { $inc: { totalProducts: -1 } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}