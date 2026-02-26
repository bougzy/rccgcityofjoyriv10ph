import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Announcement from '@/lib/models/Announcement';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const isActive = searchParams.get('isActive');
    const includeParents = searchParams.get('includeParents') === 'true';

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};

    if (isActive !== null && isActive !== undefined && isActive !== '') {
      filter.isActive = isActive === 'true';
    }

    if (includeParents && level && entityId) {
      // Include announcements for the entity itself,
      // plus parent-level announcements with visibleToChildren=true
      const levelHierarchy = ['province', 'zone', 'area', 'parish'];
      const currentLevelIndex = levelHierarchy.indexOf(level);
      const parentLevels = levelHierarchy.slice(0, currentLevelIndex);

      filter.$or = [
        // The entity's own announcements
        { level, entityId },
        // Parent-level announcements visible to children
        ...(parentLevels.length > 0
          ? [{ level: { $in: parentLevels }, visibleToChildren: true }]
          : []),
      ];
    } else {
      if (level) {
        filter.level = level;
      }
      if (entityId) {
        filter.entityId = entityId;
      }
    }

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('GET /api/announcements error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const announcement = await Announcement.create(body);

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('POST /api/announcements error:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}
