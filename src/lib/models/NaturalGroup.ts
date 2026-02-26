import mongoose, { Schema, Document } from 'mongoose';

export const NATURAL_GROUP_TYPES = [
  'yaya',
  'men-fellowship',
  'women-fellowship',
  'teens-church',
  'children-church',
  'singles-fellowship',
  'married-couples',
  'senior-citizens',
  'choir',
  'ushers',
  'protocol',
  'sunday-school',
  'workers-in-training',
  'evangelism',
  'media-technical',
  'prayer-intercession',
] as const;

export type NaturalGroupType = typeof NATURAL_GROUP_TYPES[number];

export interface INaturalGroup extends Document {
  parish: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  type: NaturalGroupType;
  description: string;
  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;
  leaderName: string;
  leaderPhone: string;
  leaderEmail: string;
  coverImage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NaturalGroupSchema = new Schema<INaturalGroup>(
  {
    parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    type: {
      type: String,
      enum: NATURAL_GROUP_TYPES,
      required: true,
    },
    description: { type: String, default: '' },
    meetingDay: { type: String, default: '' },
    meetingTime: { type: String, default: '' },
    meetingVenue: { type: String, default: '' },
    leaderName: { type: String, default: '' },
    leaderPhone: { type: String, default: '' },
    leaderEmail: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

NaturalGroupSchema.index({ parish: 1, type: 1 }, { unique: true });
NaturalGroupSchema.index({ slug: 1 });

export default mongoose.models.NaturalGroup || mongoose.model<INaturalGroup>('NaturalGroup', NaturalGroupSchema);
