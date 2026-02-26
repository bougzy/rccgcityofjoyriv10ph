import mongoose, { Schema, Document } from 'mongoose';

export interface IGrowthReport extends Document {
  province: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  area?: mongoose.Types.ObjectId;
  parish?: mongoose.Types.ObjectId;
  level: string;
  entityId: mongoose.Types.ObjectId;
  entityName: string;
  period: string;
  periodType: string;
  sundayAttendance: number;
  midweekAttendance: number;
  newConverts: number;
  baptisms: number;
  outreachActivities: number;
  houseFellowshipCount: number;
  houseFellowshipAttendance: number;
  firstTimers: number;
  firstTimerRetention: number;
  totalMembers: number;
  activeMembers: number;
  notes: string;
  submittedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const GrowthReportSchema = new Schema<IGrowthReport>({
  province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
  zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
  area: { type: Schema.Types.ObjectId, ref: 'Area' },
  parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
  level: {
    type: String,
    enum: ['province', 'zone', 'area', 'parish'],
    required: true,
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityName: { type: String, default: '' },
  period: { type: String, required: true },
  periodType: {
    type: String,
    enum: ['weekly', 'monthly'],
    default: 'weekly',
  },
  sundayAttendance: { type: Number, default: 0 },
  midweekAttendance: { type: Number, default: 0 },
  newConverts: { type: Number, default: 0 },
  baptisms: { type: Number, default: 0 },
  outreachActivities: { type: Number, default: 0 },
  houseFellowshipCount: { type: Number, default: 0 },
  houseFellowshipAttendance: { type: Number, default: 0 },
  firstTimers: { type: Number, default: 0 },
  firstTimerRetention: { type: Number, default: 0 },
  totalMembers: { type: Number, default: 0 },
  activeMembers: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

GrowthReportSchema.index({ level: 1, entityId: 1, period: 1 }, { unique: true });

export default mongoose.models.GrowthReport || mongoose.model<IGrowthReport>('GrowthReport', GrowthReportSchema);
