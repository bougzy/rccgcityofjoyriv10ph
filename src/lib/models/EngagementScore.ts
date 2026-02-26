import mongoose, { Schema, Document } from 'mongoose';

export interface IEngagementScore extends Document {
  userId?: mongoose.Types.ObjectId;
  memberId: string;
  memberName: string;
  memberEmail: string;
  parish: mongoose.Types.ObjectId;
  naturalGroups: mongoose.Types.ObjectId[];
  attendanceScore: number;
  participationScore: number;
  volunteerScore: number;
  evangelismScore: number;
  overallScore: number;
  classification: string;
  lastCalculated: Date;
  monthlyHistory: { month: string; score: number }[];
  createdAt: Date;
  updatedAt: Date;
}

const EngagementScoreSchema = new Schema<IEngagementScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    memberId: { type: String, default: '' },
    memberName: { type: String, required: true },
    memberEmail: { type: String, default: '' },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true },
    naturalGroups: [{ type: Schema.Types.ObjectId, ref: 'NaturalGroup' }],
    attendanceScore: { type: Number, default: 0, min: 0, max: 100 },
    participationScore: { type: Number, default: 0, min: 0, max: 100 },
    volunteerScore: { type: Number, default: 0, min: 0, max: 100 },
    evangelismScore: { type: Number, default: 0, min: 0, max: 100 },
    overallScore: { type: Number, default: 0, min: 0, max: 100 },
    classification: {
      type: String,
      enum: ['highly-active', 'active', 'at-risk', 'inactive'],
      default: 'inactive',
    },
    lastCalculated: { type: Date, default: Date.now },
    monthlyHistory: [
      {
        month: { type: String },
        score: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

EngagementScoreSchema.index({ parish: 1, classification: 1 });
EngagementScoreSchema.index({ overallScore: -1 });

export default mongoose.models.EngagementScore || mongoose.model<IEngagementScore>('EngagementScore', EngagementScoreSchema);
