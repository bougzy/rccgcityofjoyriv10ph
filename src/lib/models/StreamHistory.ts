import mongoose, { Schema, Document } from 'mongoose';

export interface IStreamHistoryDoc extends Document {
  title: string;
  preacher: string;
  platform: string;
  videoId: string;
  streamUrl: string;
  duration: string;
  quality: string;
  category: string;
  description: string;
  destinations: string[];
  savedAsSermon: boolean;
  sermonId?: mongoose.Types.ObjectId;
  endedAt: Date;
}

const StreamHistorySchema = new Schema<IStreamHistoryDoc>({
  title: { type: String, default: '' },
  preacher: { type: String, default: '' },
  platform: { type: String, default: '' },
  videoId: { type: String, default: '' },
  streamUrl: { type: String, default: '' },
  duration: { type: String, default: '' },
  quality: { type: String, default: '' },
  category: { type: String, default: '' },
  description: { type: String, default: '' },
  destinations: [{ type: String }],
  savedAsSermon: { type: Boolean, default: false },
  sermonId: { type: Schema.Types.ObjectId, ref: 'Sermon' },
  endedAt: { type: Date, default: Date.now },
});

export default mongoose.models.StreamHistory || mongoose.model<IStreamHistoryDoc>('StreamHistory', StreamHistorySchema);
