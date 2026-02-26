import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    // Allow parish-admin and above to list users (for admin assignment)
    await requireRole(['super-admin', 'zone-admin', 'area-admin', 'parish-admin']);
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search');
    const scopeType = searchParams.get('scopeType');
    const scopeId = searchParams.get('scopeId');
    const parishId = searchParams.get('parishId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const filter: Record<string, unknown> = {};
    if (role) filter.role = role;
    if (isActive !== null && isActive !== '') filter.isActive = isActive === 'true';
    if (scopeType) filter.scopeType = scopeType;
    if (scopeId) filter.scopeId = scopeId;
    if (parishId) filter.parishId = parishId;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .limit(limit)
      .lean();

    return NextResponse.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users';
    const status = message.includes('Unauthorized') || message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole(['super-admin']);
    await dbConnect();

    const body = await request.json();
    const { name, email, password, phone, role, scopeType, scopeId, parishId, naturalGroupId } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    // Enforce max 2 admins per parish or group
    if (role === 'parish-admin' && scopeId) {
      const count = await User.countDocuments({ scopeType: 'parish', scopeId, isActive: true });
      if (count >= 2) {
        return NextResponse.json({ error: 'Maximum 2 parish admins allowed per parish' }, { status: 400 });
      }
    }
    if (role === 'group-admin' && scopeId) {
      const count = await User.countDocuments({ scopeType: 'group', scopeId, isActive: true });
      if (count >= 2) {
        return NextResponse.json({ error: 'Maximum 2 group admins allowed per natural group' }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || '',
      role: role || 'member',
      scopeType: scopeType || 'province',
      scopeId,
      parishId,
      naturalGroupId,
    });

    const result = user.toObject();
    delete result.password;

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    const status = message.includes('Unauthorized') || message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
