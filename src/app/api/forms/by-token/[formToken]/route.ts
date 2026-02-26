import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/lib/models/Form';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ formToken: string }> }
) {
  try {
    await dbConnect();
    const { formToken } = await params;

    if (!formToken) {
      return NextResponse.json({ error: 'Form token is required' }, { status: 400 });
    }

    const form = await Form.findOne({ formToken, isActive: true }).lean();

    if (!form) {
      return NextResponse.json({ error: 'Form not found or inactive' }, { status: 404 });
    }

    // Check expiration
    if (form.expiresAt && new Date() > new Date(form.expiresAt as string)) {
      return NextResponse.json({ error: 'This form has expired' }, { status: 410 });
    }

    // Check max submissions
    if (
      form.maxSubmissions &&
      typeof form.submissionCount === 'number' &&
      form.submissionCount >= form.maxSubmissions
    ) {
      return NextResponse.json(
        { error: 'This form has reached the maximum number of submissions' },
        { status: 410 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('GET /api/forms/by-token/[formToken] error:', error);
    return NextResponse.json({ error: 'Failed to fetch form' }, { status: 500 });
  }
}
