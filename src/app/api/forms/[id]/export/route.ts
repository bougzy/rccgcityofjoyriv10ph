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

    const form = await Form.findById(id).lean();
    if (!form) return NextResponse.json({ error: 'Form not found' }, { status: 404 });

    const submissions = await FormSubmission.find({ form: id })
      .sort('-submittedAt')
      .lean();

    // Build CSV
    const fields = form.fields || [];
    const headers = ['Submitted By', 'Submitted At', ...fields.map((f: { label: string }) => f.label)];
    const rows = submissions.map((s) => {
      const responses = s.responses instanceof Map ? Object.fromEntries(s.responses) : (s.responses || {});
      return [
        s.submittedBy || 'Anonymous',
        new Date(s.submittedAt).toISOString(),
        ...fields.map((f: { fieldId: string }) => {
          const val = responses[f.fieldId];
          return typeof val === 'string' ? val : JSON.stringify(val || '');
        }),
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${form.title.replace(/[^a-z0-9]/gi, '_')}_submissions.csv"`,
      },
    });
  } catch (error) {
    console.error('GET /api/forms/[id]/export error:', error);
    return NextResponse.json({ error: 'Failed to export' }, { status: 500 });
  }
}
