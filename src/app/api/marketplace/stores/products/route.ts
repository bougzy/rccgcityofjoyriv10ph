import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import MarketplaceProduct from '@/lib/models/MarketplaceProduct';
import MarketplaceStore from '@/lib/models/MarketplaceStore';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = { isActive: true };
    if (storeId) query.storeId = storeId;
    if (category && category !== 'all') query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };

    const products = await MarketplaceProduct.find(query)
      .populate('storeId', 'storeName whatsappNumber status')
      .sort({ createdAt: -1 });

    // Filter to only products from approved stores (unless querying specific store by owner)
    const filtered = products.filter((p) => {
      const store = p.storeId as { status?: string };
      return store?.status === 'approved';
    });

    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const body = await req.json();

    // Verify store belongs to this user and is approved
    const store = await MarketplaceStore.findOne({
      _id: body.storeId,
      ownerEmail: session.user.email,
      status: 'approved',
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found or not approved' }, { status: 403 });
    }

    const product = await MarketplaceProduct.create(body);

    // Update store product count
    await MarketplaceStore.findByIdAndUpdate(body.storeId, { $inc: { totalProducts: 1 } });

    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}