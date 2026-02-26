import mongoose, { Schema, Document } from 'mongoose';

export interface IProvinceDoc extends Document {
  name: string;
  shortName: string;
  picName: string;
  picPhone: string;
  picEmail: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProvinceSchema = new Schema<IProvinceDoc>(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    picName: { type: String, default: '' },
    picPhone: { type: String, default: '' },
    picEmail: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Province || mongoose.model<IProvinceDoc>('Province', ProvinceSchema);
