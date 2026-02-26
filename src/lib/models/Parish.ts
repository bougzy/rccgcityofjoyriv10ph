import mongoose, { Schema, Document } from 'mongoose';

export interface IParishDoc extends Document {
  province: mongoose.Types.ObjectId;
  zone: mongoose.Types.ObjectId;
  area: mongoose.Types.ObjectId;
  name: string;
  code: string;
  pastorName: string;
  pastorPhone: string;
  pastorEmail: string;
  address: string;
  isHeadquarters: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ParishSchema = new Schema<IParishDoc>(
  {
    province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    area: { type: Schema.Types.ObjectId, ref: 'Area', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    pastorName: { type: String, default: '' },
    pastorPhone: { type: String, default: '' },
    pastorEmail: { type: String, default: '' },
    address: { type: String, default: '' },
    isHeadquarters: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Parish || mongoose.model<IParishDoc>('Parish', ParishSchema);
