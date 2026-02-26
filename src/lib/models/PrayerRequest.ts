import mongoose, { Schema, Document } from 'mongoose';

export interface IPrayerRequest extends Document {
  authorName: string;
  authorEmail: string;
  parish?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  isAnonymous: boolean;
  category: string;
  status: string;
  prayerCount: number;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PrayerRequestSchema = new Schema<IPrayerRequest>(
  {
    authorName: { type: String, required: true },
    authorEmail: { type: String, default: '' },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['healing', 'provision', 'family', 'guidance', 'thanksgiving', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['active', 'answered', 'archived'],
      default: 'active',
    },
    prayerCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PrayerRequestSchema.index({ isApproved: 1, status: 1, createdAt: -1 });

export default mongoose.models.PrayerRequest || mongoose.model<IPrayerRequest>('PrayerRequest', PrayerRequestSchema);
