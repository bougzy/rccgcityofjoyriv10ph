import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  scopeType: string;
  scopeId: mongoose.Types.ObjectId;
  assignedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const RoleSchema = new Schema<IRole>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['zone-admin', 'area-admin', 'parish-admin', 'group-admin'],
    required: true,
  },
  scopeType: {
    type: String,
    enum: ['zone', 'area', 'parish', 'group'],
    required: true,
  },
  scopeId: { type: Schema.Types.ObjectId, required: true },
  assignedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

RoleSchema.index({ userId: 1, scopeType: 1, scopeId: 1 }, { unique: true });

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
