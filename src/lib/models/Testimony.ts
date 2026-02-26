import mongoose, { Schema, Document } from 'mongoose';

export interface ITestimony extends Document {
  authorName: string;
  authorEmail: string;
  parish?: mongoose.Types.ObjectId;
  title: string;
  body: string;
  category: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: Date;
}

const TestimonySchema = new Schema<ITestimony>({
  authorName: { type: String, required: true },
  authorEmail: { type: String, default: '' },
  parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
  title: { type: String, required: true },
  body: { type: String, required: true },
  category: {
    type: String,
    enum: ['healing', 'provision', 'salvation', 'deliverance', 'breakthrough', 'other'],
    default: 'other',
  },
  isApproved: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

TestimonySchema.index({ isApproved: 1, createdAt: -1 });

export default mongoose.models.Testimony || mongoose.model<ITestimony>('Testimony', TestimonySchema);
