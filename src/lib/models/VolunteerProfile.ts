import mongoose, { Schema, Document } from 'mongoose';

export interface IVolunteerProfile extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email: string;
  parish: mongoose.Types.ObjectId;
  skills: string[];
  availability: string;
  naturalGroups: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

const VolunteerProfileSchema = new Schema<IVolunteerProfile>({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true },
  skills: [{ type: String }],
  availability: {
    type: String,
    enum: ['weekdays', 'weekends', 'both', 'flexible'],
    default: 'flexible',
  },
  naturalGroups: [{ type: Schema.Types.ObjectId, ref: 'NaturalGroup' }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

VolunteerProfileSchema.index({ parish: 1, skills: 1 });

export default mongoose.models.VolunteerProfile || mongoose.model<IVolunteerProfile>('VolunteerProfile', VolunteerProfileSchema);
