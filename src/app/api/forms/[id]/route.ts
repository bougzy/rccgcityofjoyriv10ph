import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/lib/models/Form';
import { getSessionUser, hasMinimumRole } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const form = await Form.findById(id).lean();
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    return NextResponse.json(form);
  } catch (error) {
    console.error('GET /api/forms/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const form = await Form.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    return NextResponse.json(form);
  } catch (error) {
    console.error('PUT /api/forms/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update form' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user || !hasMinimumRole(user.role || '', 'parish-admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    const form = await Form.findByIdAndDelete(id);
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    return NextResponse.json({ message: 'Form deleted' });
  } catch (error) {
    console.error('DELETE /api/forms/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete form' }, { status: 500 });
  }
}
