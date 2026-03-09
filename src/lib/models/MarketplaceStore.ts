import mongoose, { Schema, Document } from 'mongoose';

export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface IMarketplaceStore extends Document {
  ownerId: mongoose.Types.ObjectId;
  ownerName: string;
  ownerEmail: string;
  storeName: string;
  description: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsappNumber: string;
  category: string;
  status: StoreStatus;
  setupFeePaid: boolean;
  setupFeeAmount: number;
  setupFeeProof?: string;
  rejectionReason?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  totalProducts: number;
  totalViews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceStoreSchema = new Schema<IMarketplaceStore>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true },
    storeName: { type: String, required: true },
    description: { type: String, required: true },
    logoUrl: { type: String },
    bannerUrl: { type: String },
    whatsappNumber: { type: String, required: true },
    category: { type: String, default: 'general' },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    setupFeePaid: { type: Boolean, default: false },
    setupFeeAmount: { type: Number, default: 5000 },
    setupFeeProof: { type: String },
    rejectionReason: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    totalProducts: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

MarketplaceStoreSchema.index({ status: 1 });
MarketplaceStoreSchema.index({ ownerId: 1 });

export default mongoose.models.MarketplaceStore ||
  mongoose.model<IMarketplaceStore>('MarketplaceStore', MarketplaceStoreSchema);