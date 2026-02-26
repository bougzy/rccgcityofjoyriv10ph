import mongoose, { Schema, Document } from 'mongoose';

export interface IEventAttendance extends Document {
  event: mongoose.Types.ObjectId;
  fullName: string;
  phone: string;
  email: string;
  parish?: mongoose.Types.ObjectId;
  parishName: string;
  naturalGroup: string;
  isFirstTimer: boolean;
  memberId: string;
  checkInMethod: string;
  checkInTime: Date;
  syncStatus: string;
  createdAt: Date;
}

const EventAttendanceSchema = new Schema<IEventAttendance>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
  parishName: { type: String, default: '' },
  naturalGroup: { type: String, default: '' },
  isFirstTimer: { type: Boolean, default: false },
  memberId: { type: String, default: '' },
  checkInMethod: {
    type: String,
    enum: ['qr', 'form', 'manual', 'csv'],
    default: 'form',
  },
  checkInTime: { type: Date, default: Date.now },
  syncStatus: {
    type: String,
    enum: ['synced', 'pending'],
    default: 'synced',
  },
  createdAt: { type: Date, default: Date.now },
});

EventAttendanceSchema.index({ event: 1, phone: 1 });
EventAttendanceSchema.index({ event: 1, createdAt: -1 });

export default mongoose.models.EventAttendance || mongoose.model<IEventAttendance>('EventAttendance', EventAttendanceSchema);
