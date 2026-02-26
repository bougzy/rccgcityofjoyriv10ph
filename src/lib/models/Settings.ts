import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveCounter {
  count: number;
  isActive: boolean;
  label: string;
}

export interface ISettingsDoc extends Document {
  key: string;
  youtubeChannelId: string;
  facebookPageId: string;
  defaultQuality: string;
  provinceName: string;
  liveCounter: ILiveCounter;
  updatedAt: Date;
}

const SettingsSchema = new Schema<ISettingsDoc>(
  {
    key: { type: String, required: true, unique: true },
    youtubeChannelId: { type: String, default: '' },
    facebookPageId: { type: String, default: '' },
    defaultQuality: { type: String, default: '720p' },
    provinceName: { type: String, default: 'Rivers Province 10' },
    liveCounter: {
      count: { type: Number, default: 0 },
      isActive: { type: Boolean, default: false },
      label: { type: String, default: 'Live Attendance' },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Settings || mongoose.model<ISettingsDoc>('Settings', SettingsSchema);
