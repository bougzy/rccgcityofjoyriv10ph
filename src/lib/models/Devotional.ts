import mongoose, { Schema, Document } from 'mongoose';

export interface IDevotional extends Document {
  title: string;
  date: Date;
  scripture: string;
  body: string;
  author: string;
  coverImage: string;
  isPublished: boolean;
  createdAt: Date;
}

const DevotionalSchema = new Schema<IDevotional>({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  scripture: { type: String, default: '' },
  body: { type: String, required: true },
  author: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

DevotionalSchema.index({ date: -1, isPublished: 1 });

export default mongoose.models.Devotional || mongoose.model<IDevotional>('Devotional', DevotionalSchema);
