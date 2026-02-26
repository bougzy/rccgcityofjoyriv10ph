import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super-admin' | 'zone-admin' | 'area-admin' | 'parish-admin' | 'group-admin' | 'member';
export type ScopeType = 'province' | 'zone' | 'area' | 'parish' | 'group';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  scopeType: ScopeType;
  scopeId: mongoose.Types.ObjectId;
  parishId?: mongoose.Types.ObjectId;
  naturalGroupId?: mongoose.Types.ObjectId;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  role: {
    type: String,
    enum: ['super-admin', 'zone-admin', 'area-admin', 'parish-admin', 'group-admin', 'member'],
    default: 'super-admin',
  },
  scopeType: {
    type: String,
    enum: ['province', 'zone', 'area', 'parish', 'group'],
    default: 'province',
  },
  scopeId: { type: Schema.Types.ObjectId },
  parishId: { type: Schema.Types.ObjectId, ref: 'Parish' },
  naturalGroupId: { type: Schema.Types.ObjectId, ref: 'NaturalGroup' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ scopeType: 1, scopeId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
