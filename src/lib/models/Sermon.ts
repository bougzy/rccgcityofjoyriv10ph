import mongoose, { Schema, Document } from 'mongoose';

export interface ISermonDoc extends Document {
  title: string;
  preacher: string;
  category: string;
  description: string;
  bibleReference: string;
  date: string;
  mediaType: string;
  mediaUrl: string;
  thumbnailUrl: string;
  coverImageUrl: string;
  audioUrl: string;
  videoUrl: string;
  pdfUrl: string;
  youtubeVideoId: string;
  quality: string;
  duration: string;
  featured: boolean;
  isPaid: boolean;
  price: number;
  destinations: string[];
  parish?: mongoose.Types.ObjectId;
  views: number;
  downloads: number;
  createdAt: Date;
}

const SermonSchema = new Schema<ISermonDoc>({
  title: { type: String, required: true },
  preacher: { type: String, default: '' },
  category: { type: String, default: 'sunday-service' },
  description: { type: String, default: '' },
  bibleReference: { type: String, default: '' },
  date: { type: String, default: '' },
  mediaType: { type: String, enum: ['video', 'audio', 'image'], default: 'video' },
  mediaUrl: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  coverImageUrl: { type: String, default: '' },
  audioUrl: { type: String, default: '' },
  videoUrl: { type: String, default: '' },
  pdfUrl: { type: String, default: '' },
  youtubeVideoId: { type: String, default: '' },
  quality: { type: String, default: '' },
  duration: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  destinations: [{ type: String }],
  parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
  views: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Sermon || mongoose.model<ISermonDoc>('Sermon', SermonSchema);
