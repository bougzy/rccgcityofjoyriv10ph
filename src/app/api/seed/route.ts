import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Province from '@/lib/models/Province';
import Zone from '@/lib/models/Zone';
import Area from '@/lib/models/Area';
import Parish from '@/lib/models/Parish';
import NaturalGroup from '@/lib/models/NaturalGroup';
import Settings from '@/lib/models/Settings';
import { PROVINCE_SEED, HIERARCHY_SEED, ADMIN_SEED, SAMPLE_USERS, NATURAL_GROUP_SEED } from '@/lib/constants/hierarchy-seed';

export async function POST() {
  try {
    await dbConnect();

    // Check if already seeded
    const existingProvince = await Province.findOne({ shortName: 'RP10' });
    if (existingProvince) {
      return NextResponse.json({ message: 'Database already seeded' }, { status: 200 });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash(ADMIN_SEED.password, 12);
    await User.findOneAndUpdate(
      { email: ADMIN_SEED.email },
      { ...ADMIN_SEED, password: hashedPassword, scopeType: 'province' },
      { upsert: true, new: true }
    );

    // Create province
    const province = await Province.create(PROVINCE_SEED);

    // Track first zone, area, parish for sample users
    let firstZoneId: string | null = null;
    let firstAreaId: string | null = null;
    let firstParishId: string | null = null;

    // Create hierarchy
    for (const zoneSeed of HIERARCHY_SEED.zones) {
      const zone = await Zone.create({
        province: province._id,
        name: zoneSeed.name,
        code: zoneSeed.code,
        zonalPastorName: zoneSeed.zonalPastorName,
      });

      if (!firstZoneId) firstZoneId = zone._id.toString();

      for (const areaSeed of zoneSeed.areas) {
        const area = await Area.create({
          province: province._id,
          zone: zone._id,
          name: areaSeed.name,
          code: areaSeed.code,
          areaPastorName: areaSeed.areaPastorName,
        });

        if (!firstAreaId) firstAreaId = area._id.toString();

        for (const parishSeed of areaSeed.parishes) {
          const parish = await Parish.create({
            province: province._id,
            zone: zone._id,
            area: area._id,
            name: parishSeed.name,
            code: parishSeed.code,
            pastorName: parishSeed.pastorName,
            address: parishSeed.address,
            isHeadquarters: parishSeed.isHeadquarters,
          });

          if (!firstParishId) firstParishId = parish._id.toString();

          // Seed natural groups for headquarters parish
          if (parishSeed.isHeadquarters) {
            for (const groupSeed of NATURAL_GROUP_SEED) {
              await NaturalGroup.create({
                parish: parish._id,
                name: groupSeed.name,
                slug: groupSeed.slug,
                type: groupSeed.type,
                meetingDay: groupSeed.meetingDay,
                meetingTime: groupSeed.meetingTime,
              });
            }
          }
        }
      }
    }

    // Create sample users with proper scope IDs
    const scopeIdMap: Record<string, string | null> = {
      zone: firstZoneId,
      area: firstAreaId,
      parish: firstParishId,
    };

    for (const userSeed of SAMPLE_USERS) {
      const pwd = await bcrypt.hash(userSeed.password, 12);
      const scopeId = scopeIdMap[userSeed.scopeType];
      await User.findOneAndUpdate(
        { email: userSeed.email },
        {
          ...userSeed,
          password: pwd,
          scopeId,
          parishId: userSeed.scopeType === 'parish' ? scopeId : undefined,
        },
        { upsert: true, new: true }
      );
    }

    // Create default settings
    await Settings.findOneAndUpdate(
      { key: 'general' },
      { key: 'general', provinceName: 'Rivers Province 10' },
      { upsert: true }
    );

    return NextResponse.json({
      message: 'Database seeded successfully',
      admin: { email: ADMIN_SEED.email, password: ADMIN_SEED.password },
      sampleUsers: SAMPLE_USERS.map(u => ({ email: u.email, password: u.password, role: u.role })),
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
