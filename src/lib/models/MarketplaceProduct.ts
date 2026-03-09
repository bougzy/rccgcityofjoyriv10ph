import mongoose, { Schema, Document } from 'mongoose';

export type ProductCategory =
  | 'food-beverages'
  | 'clothing-fashion'
  | 'books-media'
  | 'electronics'
  | 'home-garden'
  | 'beauty-health'
  | 'services'
  | 'crafts-handmade'
  | 'other';

export type ProductCondition = 'new' | 'used-good' | 'used-fair';

export interface IMarketplaceProduct extends Document {
  storeId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: ProductCategory;
  condition: ProductCondition;
  images: string[];
  inStock: boolean;
  quantity?: number;
  tags: string[];
  isActive: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplaceProductSchema = new Schema<IMarketplaceProduct>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: 'MarketplaceStore', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'NGN' },
    category: {
      type: String,
      enum: ['food-beverages', 'clothing-fashion', 'books-media', 'electronics', 'home-garden', 'beauty-health', 'services', 'crafts-handmade', 'other'],
      default: 'other',
    },
    condition: {
      type: String,
      enum: ['new', 'used-good', 'used-fair'],
      default: 'new',
    },
    images: [{ type: String }],
    inStock: { type: Boolean, default: true },
    quantity: { type: Number },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MarketplaceProductSchema.index({ storeId: 1, isActive: 1 });
MarketplaceProductSchema.index({ category: 1, isActive: 1 });

export default mongoose.models.MarketplaceProduct ||
  mongoose.model<IMarketplaceProduct>('MarketplaceProduct', MarketplaceProductSchema);