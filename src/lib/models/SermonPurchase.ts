import mongoose, { Schema, Document } from 'mongoose';

export interface ISermonPurchase extends Document {
  sermon: mongoose.Types.ObjectId;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  amount: number;
  paymentProofUrl: string;
  status: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  accessGranted: boolean;
  createdAt: Date;
}

const SermonPurchaseSchema = new Schema<ISermonPurchase>({
  sermon: { type: Schema.Types.ObjectId, ref: 'Sermon', required: true },
  buyerName: { type: String, required: true },
  buyerEmail: { type: String, required: true },
  buyerPhone: { type: String, default: '' },
  amount: { type: Number, default: 0 },
  paymentProofUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  accessGranted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

SermonPurchaseSchema.index({ sermon: 1, buyerEmail: 1 });
SermonPurchaseSchema.index({ status: 1 });

export default mongoose.models.SermonPurchase || mongoose.model<ISermonPurchase>('SermonPurchase', SermonPurchaseSchema);
