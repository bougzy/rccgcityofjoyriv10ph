import mongoose, { Schema, Document } from 'mongoose';

export interface IMembershipSnapshotDoc extends Document {
  province: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  area?: mongoose.Types.ObjectId;
  parish?: mongoose.Types.ObjectId;
  level: string;
  entityId: mongoose.Types.ObjectId;
  month: string;
  totalMembers: number;
  totalWorkers: number;
  newMembers: number;
  newConverts: number;
  createdAt: Date;
}

const MembershipSnapshotSchema = new Schema<IMembershipSnapshotDoc>({
  province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
  zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
  area: { type: Schema.Types.ObjectId, ref: 'Area' },
  parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
  level: { type: String, enum: ['province', 'zone', 'area', 'parish'], required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  month: { type: String, required: true },
  totalMembers: { type: Number, default: 0 },
  totalWorkers: { type: Number, default: 0 },
  newMembers: { type: Number, default: 0 },
  newConverts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

MembershipSnapshotSchema.index({ entityId: 1, month: 1 });

export default mongoose.models.MembershipSnapshot || mongoose.model<IMembershipSnapshotDoc>('MembershipSnapshot', MembershipSnapshotSchema);
