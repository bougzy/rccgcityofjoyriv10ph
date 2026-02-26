import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import dbConnect from './db';
import Zone from './models/Zone';
import Area from './models/Area';
import Parish from './models/Parish';
import NaturalGroup from './models/NaturalGroup';
import type { UserRole, ScopeType } from '@/types';

// Role hierarchy — higher index = more authority
const ROLE_HIERARCHY: Record<UserRole, number> = {
  'member': 0,
  'group-admin': 1,
  'parish-admin': 2,
  'area-admin': 3,
  'zone-admin': 4,
  'super-admin': 5,
};

// Scope hierarchy for containment checks
const SCOPE_HIERARCHY: Record<ScopeType, number> = {
  'group': 0,
  'parish': 1,
  'area': 2,
  'zone': 3,
  'province': 4,
};

export interface SessionUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  scopeType?: string;
  scopeId?: string;
  parishId?: string;
  naturalGroupId?: string;
}

/**
 * Get the current server session user.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

/**
 * Check if a user's role meets the minimum required role.
 */
export function hasMinimumRole(userRole: string, requiredRole: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole as UserRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 999);
}

/**
 * Require the session user to have one of the allowed roles.
 * Returns the user if authorized, throws a descriptive error otherwise.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized: Not authenticated');
  if (!user.role || !allowedRoles.includes(user.role as UserRole)) {
    throw new Error(`Forbidden: Requires one of [${allowedRoles.join(', ')}]`);
  }
  return user;
}

/**
 * Check if a user's scope contains a target scope.
 * e.g., a zone-admin for Zone X can access Parishes within Zone X.
 */
export async function canAccessScope(
  userScopeType: string,
  userScopeId: string,
  targetType: ScopeType,
  targetId: string
): Promise<boolean> {
  // Super-admin (province scope) can access everything
  if (userScopeType === 'province') return true;

  // Same scope and same ID — direct match
  if (userScopeType === targetType && userScopeId === targetId) return true;

  // User's scope must be higher than or equal to target scope
  if ((SCOPE_HIERARCHY[userScopeType as ScopeType] ?? -1) < (SCOPE_HIERARCHY[targetType] ?? 999)) {
    return false;
  }

  await dbConnect();

  // Check containment by walking the hierarchy
  if (userScopeType === 'zone') {
    if (targetType === 'area') {
      const area = await Area.findById(targetId).lean();
      return area?.zone?.toString() === userScopeId;
    }
    if (targetType === 'parish') {
      const parish = await Parish.findById(targetId).lean();
      return parish?.zone?.toString() === userScopeId;
    }
    if (targetType === 'group') {
      const group = await NaturalGroup.findById(targetId).populate('parish').lean();
      if (!group) return false;
      const parish = await Parish.findById(group.parish).lean();
      return parish?.zone?.toString() === userScopeId;
    }
  }

  if (userScopeType === 'area') {
    if (targetType === 'parish') {
      const parish = await Parish.findById(targetId).lean();
      return parish?.area?.toString() === userScopeId;
    }
    if (targetType === 'group') {
      const group = await NaturalGroup.findById(targetId).lean();
      if (!group) return false;
      const parish = await Parish.findById(group.parish).lean();
      return parish?.area?.toString() === userScopeId;
    }
  }

  if (userScopeType === 'parish') {
    if (targetType === 'group') {
      const group = await NaturalGroup.findById(targetId).lean();
      return group?.parish?.toString() === userScopeId;
    }
  }

  return false;
}

/**
 * Get filter conditions for queries based on user's scope.
 * Returns a MongoDB query filter that limits results to the user's scope.
 */
export async function getScopeFilter(user: SessionUser): Promise<Record<string, unknown>> {
  if (!user.role || !user.scopeType || !user.scopeId) return {};

  if (user.role === 'super-admin' || user.scopeType === 'province') {
    return {}; // No filter — see everything
  }

  await dbConnect();

  if (user.scopeType === 'zone') {
    return { zone: user.scopeId };
  }

  if (user.scopeType === 'area') {
    return { area: user.scopeId };
  }

  if (user.scopeType === 'parish') {
    return { parish: user.scopeId };
  }

  if (user.scopeType === 'group') {
    return { naturalGroup: user.scopeId };
  }

  return {};
}

/**
 * Check if user can manage a specific hierarchy level.
 */
export function canManageLevel(userRole: string, targetLevel: string): boolean {
  const roleMap: Record<string, string[]> = {
    'super-admin': ['province', 'zone', 'area', 'parish', 'group'],
    'zone-admin': ['zone', 'area', 'parish', 'group'],
    'area-admin': ['area', 'parish', 'group'],
    'parish-admin': ['parish', 'group'],
    'group-admin': ['group'],
    'member': [],
  };
  return (roleMap[userRole] || []).includes(targetLevel);
}

/**
 * Get admins count for a specific scope (for enforcing max 2 parish/group admins).
 */
export async function getAdminCount(scopeType: ScopeType, scopeId: string): Promise<number> {
  await dbConnect();
  const User = (await import('./models/User')).default;
  return User.countDocuments({ scopeType, scopeId, isActive: true });
}
