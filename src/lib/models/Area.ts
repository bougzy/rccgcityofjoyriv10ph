import mongoose, { Schema, Document } from 'mongoose';

export interface IAreaDoc extends Document {
  province: mongoose.Types.ObjectId;
  zone: mongoose.Types.ObjectId;
  name: string;
  code: string;
  areaPastorName: string;
  areaPastorPhone: string;
  areaPastorEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const AreaSchema = new Schema<IAreaDoc>(
  {
    province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    areaPastorName: { type: String, default: '' },
    areaPastorPhone: { type: String, default: '' },
    areaPastorEmail: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Area || mongoose.model<IAreaDoc>('Area', AreaSchema);
