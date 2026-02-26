import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Livestream from '@/lib/models/Livestream';
import StreamHistory from '@/lib/models/StreamHistory';
import Sermon from '@/lib/models/Sermon';

export async function GET() {
  try {
    await dbConnect();

    const livestream = await Livestream.findOne().lean();

    if (!livestream) {
      return NextResponse.json({ isLive: false });
    }

    return NextResponse.json(livestream);
  } catch (error) {
    console.error('GET /api/livestream error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch livestream' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();

    // If going offline (isLive: false), handle history and auto-save
    if (body.isLive === false) {
      // Get the current livestream state before updating
      const currentStream = await Livestream.findOne().lean();

      if (currentStream && (currentStream as Record<string, unknown>).isLive) {
        const streamData = currentStream as Record<string, unknown>;

        // Create a StreamHistory entry
        const historyEntry = await StreamHistory.create({
          title: streamData.title,
          preacher: streamData.preacher,
          platform: streamData.platform,
          videoId: streamData.videoId,
          streamUrl: streamData.streamUrl,
          quality: streamData.quality,
          category: streamData.category,
          description: streamData.description,
          destinations: streamData.destinations,
          savedAsSermon: false,
          endedAt: new Date(),
        });

        // If autoSave is true, also create a Sermon
        if (streamData.autoSave || body.autoSave) {
          const sermon = await Sermon.create({
            title: streamData.title || 'Untitled Stream',
            preacher: streamData.preacher,
            category: streamData.category || 'sunday-service',
            description: streamData.description,
            mediaType: 'video',
            mediaUrl: streamData.streamUrl,
            thumbnailUrl: '',
            quality: streamData.quality,
            destinations: streamData.destinations,
            date: new Date().toISOString().split('T')[0],
          });

          // Update history entry to reference the sermon
          await StreamHistory.findByIdAndUpdate(historyEntry._id, {
            savedAsSermon: true,
            sermonId: sermon._id,
          });
        }
      }
    }

    // If going live, set startedAt
    if (body.isLive === true && !body.startedAt) {
      body.startedAt = new Date();
    }

    const livestream = await Livestream.findOneAndUpdate(
      {},
      body,
      { upsert: true, new: true, runValidators: true }
    ).lean();

    return NextResponse.json(livestream);
  } catch (error) {
    console.error('PUT /api/livestream error:', error);
    return NextResponse.json(
      { error: 'Failed to update livestream' },
      { status: 500 }
    );
  }
}
