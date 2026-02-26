import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IFormField {
  fieldId: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  placeholder: string;
}

export interface IForm extends Document {
  title: string;
  description: string;
  fields: IFormField[];
  province: mongoose.Types.ObjectId;
  zone?: mongoose.Types.ObjectId;
  area?: mongoose.Types.ObjectId;
  parish?: mongoose.Types.ObjectId;
  level: string;
  entityId: mongoose.Types.ObjectId;
  formToken: string;
  expiresAt?: Date;
  maxSubmissions?: number;
  submissionCount: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema(
  {
    fieldId: { type: String, default: () => crypto.randomBytes(4).toString('hex') },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'email', 'phone', 'number', 'dropdown', 'radio', 'checkbox', 'file', 'date', 'textarea'],
      default: 'text',
    },
    required: { type: Boolean, default: false },
    options: [{ type: String }],
    placeholder: { type: String, default: '' },
  },
  { _id: false }
);

const FormSchema = new Schema<IForm>(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    fields: [FormFieldSchema],
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
    formToken: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(12).toString('hex'),
    },
    expiresAt: { type: Date },
    maxSubmissions: { type: Number },
    submissionCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

FormSchema.index({ formToken: 1 }, { unique: true });
FormSchema.index({ level: 1, entityId: 1 });

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);
