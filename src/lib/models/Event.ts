import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IEvent extends Document {
  title: string;
  description: string;
  eventType: string;
  startDate: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  venue: string;
  coverImage: string;
  province: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  area?: mongoose.Types.ObjectId;
  parish?: mongoose.Types.ObjectId;
  level: string;
  entityId: mongoose.Types.ObjectId;
  naturalGroup?: mongoose.Types.ObjectId;
  eventToken: string;
  registrationEnabled: boolean;
  registrationFormId?: mongoose.Types.ObjectId;
  maxAttendees?: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    eventType: {
      type: String,
      enum: ['service', 'conference', 'retreat', 'outreach', 'fellowship', 'training', 'special'],
      default: 'service',
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    venue: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
    level: {
      type: String,
      enum: ['province', 'zone', 'area', 'parish', 'group'],
      required: true,
    },
    entityId: { type: Schema.Types.ObjectId, required: true },
    naturalGroup: { type: Schema.Types.ObjectId, ref: 'NaturalGroup' },
    eventToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(16).toString('hex'),
    },
    registrationEnabled: { type: Boolean, default: false },
    registrationFormId: { type: Schema.Types.ObjectId, ref: 'Form' },
    maxAttendees: { type: Number },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

EventSchema.index({ eventToken: 1 }, { unique: true });
EventSchema.index({ level: 1, entityId: 1, startDate: 1 });
EventSchema.index({ startDate: 1, isActive: 1 });

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);
