import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Form from '@/lib/models/Form';
import FormSubmission from '@/lib/models/FormSubmission';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const submissions = await FormSubmission.find({ form: id })
      .sort('-submittedAt')
      .lean();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('GET /api/forms/[id]/submissions error:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const form = await Form.findById(id);
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    if (!form.isActive) return NextResponse.json({ error: 'Form is no longer active' }, { status: 400 });

    // Check expiration
    if (form.expiresAt && new Date() > form.expiresAt) {
      return NextResponse.json({ error: 'Form has expired' }, { status: 400 });
    }

    // Check max submissions
    if (form.maxSubmissions && form.submissionCount >= form.maxSubmissions) {
      return NextResponse.json({ error: 'Maximum submissions reached' }, { status: 400 });
    }

    const body = await request.json();

    const submission = await FormSubmission.create({
      form: id,
      responses: body.responses || {},
      fileUrls: body.fileUrls || [],
      submittedBy: body.submittedBy || 'Anonymous',
    });

    // Increment submission count
    await Form.findByIdAndUpdate(id, { $inc: { submissionCount: 1 } });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('POST /api/forms/[id]/submissions error:', error);
    return NextResponse.json({ error: 'Failed to submit form' }, { status: 500 });
  }
}
