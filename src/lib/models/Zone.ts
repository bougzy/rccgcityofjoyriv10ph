import mongoose, { Schema, Document } from 'mongoose';

export interface IZoneDoc extends Document {
  province: mongoose.Types.ObjectId;
  name: string;
  code: string;
  zonalPastorName: string;
  zonalPastorPhone: string;
  zonalPastorEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const ZoneSchema = new Schema<IZoneDoc>(
  {
    province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    zonalPastorName: { type: String, default: '' },
    zonalPastorPhone: { type: String, default: '' },
    zonalPastorEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Zone || mongoose.model<IZoneDoc>('Zone', ZoneSchema);
