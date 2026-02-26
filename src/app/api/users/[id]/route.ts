import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { requireRole } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['super-admin']);
    await dbConnect();

    const { id } = await params;
    const user = await User.findById(id).select('-password').lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    const status = message.includes('Unauthorized') || message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['super-admin']);
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    // If password is being updated, hash it
    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    } else {
      delete body.password;
    }

    // Enforce max 2 admins per parish or group
    if (body.role === 'parish-admin' && body.scopeId) {
      const count = await User.countDocuments({
        _id: { $ne: id },
        scopeType: 'parish',
        scopeId: body.scopeId,
        isActive: true,
      });
      if (count >= 2) {
        return NextResponse.json({ error: 'Maximum 2 parish admins allowed per parish' }, { status: 400 });
      }
    }
    if (body.role === 'group-admin' && body.scopeId) {
      const count = await User.countDocuments({
        _id: { $ne: id },
        scopeType: 'group',
        scopeId: body.scopeId,
        isActive: true,
      });
      if (count >= 2) {
        return NextResponse.json({ error: 'Maximum 2 group admins allowed per natural group' }, { status: 400 });
      }
    }

    const user = await User.findByIdAndUpdate(id, body, { new: true })
      .select('-password')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    const status = message.includes('Unauthorized') || message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(['super-admin']);
    await dbConnect();

    const { id } = await params;
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    const status = message.includes('Unauthorized') || message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
