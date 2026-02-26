import mongoose, { Schema, Document } from 'mongoose';

export interface IConvert extends Document {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  age?: number;
  gender: string;
  parish: mongoose.Types.ObjectId;
  naturalGroup?: mongoose.Types.ObjectId;
  invitedBy: string;
  firstVisitDate: Date;
  stage: string;
  stageHistory: {
    stage: string;
    enteredAt: Date;
    notes: string;
    updatedBy?: mongoose.Types.ObjectId;
  }[];
  houseFellowship: string;
  discipleshipClass: string;
  baptismDate?: Date;
  integratedGroup?: mongoose.Types.ObjectId;
  isActive: boolean;
  notes: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConvertSchema = new Schema<IConvert>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    age: { type: Number },
    gender: { type: String, enum: ['male', 'female', ''], default: '' },
    parish: { type: Schema.Types.ObjectId, ref: 'Parish', required: true },
    naturalGroup: { type: Schema.Types.ObjectId, ref: 'NaturalGroup' },
    invitedBy: { type: String, default: '' },
    firstVisitDate: { type: Date, required: true },
    stage: {
      type: String,
      enum: ['first-visit', 'follow-up', 'house-fellowship', 'discipleship', 'baptism', 'integrated'],
      default: 'first-visit',
    },
    stageHistory: [
      {
        stage: { type: String },
        enteredAt: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
        updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    houseFellowship: { type: String, default: '' },
    discipleshipClass: { type: String, default: '' },
    baptismDate: { type: Date },
    integratedGroup: { type: Schema.Types.ObjectId, ref: 'NaturalGroup' },
    isActive: { type: Boolean, default: true },
    notes: { type: String, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ConvertSchema.index({ parish: 1, stage: 1 });
ConvertSchema.index({ parish: 1, firstVisitDate: -1 });

export default mongoose.models.Convert || mongoose.model<IConvert>('Convert', ConvertSchema);
