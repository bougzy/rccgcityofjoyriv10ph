import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDoc extends Document {
  province: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  area?: mongoose.Types.ObjectId;
  parish?: mongoose.Types.ObjectId;
  level: string;
  entityId: mongoose.Types.ObjectId;
  entityName: string;
  date: Date;
  serviceType: string;
  serviceLabel: string;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  totalYouth: number;
  totalWorkers: number;
  grandTotal: number;
  firstTimers: number;
  salvations: number;
  notes: string;
  recordedBy: string;
  createdAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDoc>({
  province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
  zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
  area: { type: Schema.Types.ObjectId, ref: 'Area' },
  parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
  level: { type: String, enum: ['province', 'zone', 'area', 'parish'], required: true },
  entityId: { type: Schema.Types.ObjectId, required: true },
  entityName: { type: String, required: true },
  date: { type: Date, required: true },
  serviceType: { type: String, required: true },
  serviceLabel: { type: String, required: true },
  totalMen: { type: Number, default: 0 },
  totalWomen: { type: Number, default: 0 },
  totalChildren: { type: Number, default: 0 },
  totalYouth: { type: Number, default: 0 },
  totalWorkers: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  firstTimers: { type: Number, default: 0 },
  salvations: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  recordedBy: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

AttendanceSchema.index({ level: 1, entityId: 1, date: -1 });
AttendanceSchema.index({ parish: 1, date: -1 });
AttendanceSchema.index({ zone: 1, date: -1 });
AttendanceSchema.index({ area: 1, date: -1 });

export default mongoose.models.Attendance || mongoose.model<IAttendanceDoc>('Attendance', AttendanceSchema);
