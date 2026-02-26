import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncementDoc extends Document {
  province: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  area?: mongoose.Types.ObjectId;
  parish?: mongoose.Types.ObjectId;
  level: string;
  entityId: mongoose.Types.ObjectId;
  title: string;
  body: string;
  priority: string;
  category: string;
  visibleToChildren: boolean;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncementDoc>(
  {
    province: { type: Schema.Types.ObjectId, ref: 'Province', required: true },
    zone: { type: Schema.Types.ObjectId, ref: 'Zone' },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish' },
    level: { type: String, enum: ['province', 'zone', 'area', 'parish'], required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    body: { type: String, default: '' },
    priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
    category: { type: String, enum: ['general', 'event', 'prayer', 'administrative', 'program'], default: 'general' },
    visibleToChildren: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: String, required: true },
    endDate: { type: String },
    createdBy: { type: String, default: '' },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ level: 1, entityId: 1, isActive: 1 });
AnnouncementSchema.index({ province: 1, isActive: 1, visibleToChildren: 1 });

export default mongoose.models.Announcement || mongoose.model<IAnnouncementDoc>('Announcement', AnnouncementSchema);
