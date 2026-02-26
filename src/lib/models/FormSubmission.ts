import mongoose, { Schema, Document } from 'mongoose';

export interface IFormSubmission extends Document {
  form: mongoose.Types.ObjectId;
  responses: Map<string, unknown>;
  fileUrls: string[];
  submittedBy: string;
  submittedAt: Date;
}

const FormSubmissionSchema = new Schema<IFormSubmission>({
  form: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  responses: { type: Map, of: Schema.Types.Mixed, default: {} },
  fileUrls: [{ type: String }],
  submittedBy: { type: String, default: 'Anonymous' },
  submittedAt: { type: Date, default: Date.now },
});

FormSubmissionSchema.index({ form: 1, submittedAt: -1 });

export default mongoose.models.FormSubmission || mongoose.model<IFormSubmission>('FormSubmission', FormSubmissionSchema);
