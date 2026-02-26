import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Role from '@/lib/models/Role';
import { getSessionUser, hasMinimumRole, canAccessScope } from '@/lib/auth-helpers';
import type { ScopeType } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSessionUser();
    if (!currentUser || !currentUser.role) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { userId, role, scopeType, scopeId, parishId, naturalGroupId } = await request.json();

    if (!userId || !role || !scopeType || !scopeId) {
      return NextResponse.json(
        { error: 'userId, role, scopeType, and scopeId are required' },
        { status: 400 }
      );
    }

    const validRoles = ['zone-admin', 'area-admin', 'parish-admin', 'group-admin', 'member'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Authorization: check if current user can assign this role
    // Super-admins can assign any role
    // Parish-admins can assign group-admin roles within their parish
    // Zone-admins can assign parish-admin and group-admin within their zone
    // Area-admins can assign parish-admin and group-admin within their area
    const isSuperAdmin = currentUser.role === 'super-admin';

    if (!isSuperAdmin) {
      // Must have higher role than the role being assigned
      if (!hasMinimumRole(currentUser.role, role === 'member' ? 'group-admin' : role === 'group-admin' ? 'parish-admin' : role === 'parish-admin' ? 'area-admin' : role === 'area-admin' ? 'zone-admin' : 'super-admin')) {
        return NextResponse.json({ error: 'You cannot assign a role equal to or above your own' }, { status: 403 });
      }

      // Must have access to the target scope
      if (currentUser.scopeType && currentUser.scopeId) {
        const hasAccess = await canAccessScope(
          currentUser.scopeType,
          currentUser.scopeId,
          scopeType as ScopeType,
          scopeId
        );
        if (!hasAccess) {
          return NextResponse.json({ error: 'You do not have access to this scope' }, { status: 403 });
        }
      } else {
        return NextResponse.json({ error: 'Forbidden: insufficient scope' }, { status: 403 });
      }
    }

    // Find the user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Enforce max 2 admins per parish or group
    if (role === 'parish-admin') {
      const count = await User.countDocuments({
        _id: { $ne: userId },
        scopeType: 'parish',
        scopeId,
        isActive: true,
      });
      if (count >= 2) {
        return NextResponse.json({ error: 'Maximum 2 parish admins allowed' }, { status: 400 });
      }
    }
    if (role === 'group-admin') {
      const count = await User.countDocuments({
        _id: { $ne: userId },
        scopeType: 'group',
        scopeId,
        isActive: true,
      });
      if (count >= 2) {
        return NextResponse.json({ error: 'Maximum 2 group admins allowed' }, { status: 400 });
      }
    }

    // Update the user's role
    targetUser.role = role;
    targetUser.scopeType = scopeType;
    targetUser.scopeId = scopeId;
    if (parishId) targetUser.parishId = parishId;
    if (naturalGroupId) targetUser.naturalGroupId = naturalGroupId;
    await targetUser.save();

    // Create role assignment record
    await Role.findOneAndUpdate(
      { userId, scopeType, scopeId },
      {
        userId,
        role,
        scopeType,
        scopeId,
        assignedBy: currentUser.id,
      },
      { upsert: true, new: true }
    );

    const result = targetUser.toObject();
    delete result.password;

    return NextResponse.json({ message: 'Role assigned successfully', user: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to assign role';
    const status = message.includes('Unauthorized') || message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
