import mongoose, { Schema, Document } from 'mongoose';

export interface ILivestreamDoc extends Document {
  isLive: boolean;
  platform: string;
  videoId: string;
  streamUrl: string;
  embedUrl: string;
  title: string;
  preacher: string;
  category: string;
  quality: string;
  description: string;
  autoSave: boolean;
  destinations: string[];
  startedAt: Date;
  updatedAt: Date;
}

const LivestreamSchema = new Schema<ILivestreamDoc>(
  {
    isLive: { type: Boolean, default: false },
    platform: { type: String, default: '' },
    videoId: { type: String, default: '' },
    streamUrl: { type: String, default: '' },
    embedUrl: { type: String, default: '' },
    title: { type: String, default: '' },
    preacher: { type: String, default: '' },
    category: { type: String, default: '' },
    quality: { type: String, default: '' },
    description: { type: String, default: '' },
    autoSave: { type: Boolean, default: true },
    destinations: [{ type: String }],
    startedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Livestream || mongoose.model<ILivestreamDoc>('Livestream', LivestreamSchema);
