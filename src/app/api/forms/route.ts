import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/lib/models/Form';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const entityId = searchParams.get('entityId');
    const isActive = searchParams.get('isActive');

    const filter: Record<string, unknown> = {};
    if (level) filter.level = level;
    if (entityId) filter.entityId = entityId;
    if (isActive !== null && isActive !== '') filter.isActive = isActive === 'true';

    const forms = await Form.find(filter).sort('-createdAt').lean();

    return NextResponse.json(forms);
  } catch (error) {
    console.error('GET /api/forms error:', error);
    return NextResponse.json({ error: 'Failed to fetch forms' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    if (!body.title || !body.fields || body.fields.length === 0) {
      return NextResponse.json({ error: 'Title and at least one field are required' }, { status: 400 });
    }

    const form = await Form.create({
      ...body,
      createdBy: user.id,
    });

    return NextResponse.json(form, { status: 201 });
  } catch (error) {
    console.error('POST /api/forms error:', error);
    return NextResponse.json({ error: 'Failed to create form' }, { status: 500 });
  }
}
