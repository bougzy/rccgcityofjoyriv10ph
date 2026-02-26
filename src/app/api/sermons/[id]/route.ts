import { NextRequest, NextResponse } from 'next/server';
import { unlink } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import Sermon from '@/lib/models/Sermon';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    // Increment views and return the updated document
    const sermon = await Sermon.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('GET /api/sermons/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sermon' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();

    const sermon = await Sermon.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).lean();

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sermon);
  } catch (error) {
    console.error('PUT /api/sermons/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to update sermon' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const sermon = await Sermon.findByIdAndDelete(id).lean();

    if (!sermon) {
      return NextResponse.json(
        { error: 'Sermon not found' },
        { status: 404 }
      );
    }

    // If the media file is a local upload, delete it from disk
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mediaUrl = (sermon as any).mediaUrl as string;
    if (mediaUrl && mediaUrl.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', mediaUrl);
        await unlink(filePath);
      } catch {
        // File may already be deleted or not exist; ignore
        console.warn(`Could not delete file at ${mediaUrl}`);
      }
    }

    return NextResponse.json({ message: 'Sermon deleted successfully' });
  } catch (error) {
    console.error('DELETE /api/sermons/[id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete sermon' },
      { status: 500 }
    );
  }
}
