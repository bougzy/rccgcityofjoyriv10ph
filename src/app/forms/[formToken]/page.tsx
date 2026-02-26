'use client';

import { useState, useEffect, use, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Ban,
  Upload,
  ChevronDown,
} from 'lucide-react';

interface FormField {
  fieldId: string;
  label: string;
  type: string;
  required: boolean;
  options: string[];
  placeholder: string;
}

interface FormData {
  _id: string;
  title: string;
  description: string;
  fields: FormField[];
  expiresAt?: string;
  maxSubmissions?: number;
  submissionCount: number;
  isActive: boolean;
}

export default function PublicFormPage({
  params,
}: {
  params: Promise<{ formToken: string }>;
}) {
  const { formToken } = use(params);
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [submitterName, setSubmitterName] = useState('');

  useEffect(() => {
    async function loadForm() {
      try {
        const res = await fetch(`/api/forms/by-token/${formToken}`);

        if (!res.ok) {
          const errData = await res.json();
          if (res.status === 410) {
            setFetchError(errData.error || 'This form is no longer accepting responses.');
          } else {
            setFetchError(errData.error || 'This form is not available.');
          }
          setLoading(false);
          return;
        }

        const formData = await res.json();
        setForm(formData);

        // Initialize responses with empty values
        const initialResponses: Record<string, unknown> = {};
        formData.fields.forEach((field: FormField) => {
          if (field.type === 'checkbox') {
            initialResponses[field.fieldId] = false;
          } else {
            initialResponses[field.fieldId] = '';
          }
        });
        setResponses(initialResponses);
      } catch {
        setFetchError('Unable to load form. Please check your connection.');
      } finally {
        setLoading(false);
      }
    }

    loadForm();
  }, [formToken]);

  const updateResponse = useCallback(
    (fieldId: string, value: unknown) => {
      setResponses((prev) => ({ ...prev, [fieldId]: value }));
      if (validationErrors[fieldId]) {
        setValidationErrors((prev) => {
          const next = { ...prev };
          delete next[fieldId];
          return next;
        });
      }
    },
    [validationErrors]
  );

  const validate = useCallback((): boolean => {
    if (!form) return false;
    const errors: Record<string, string> = {};

    form.fields.forEach((field) => {
      if (field.required) {
        const value = responses[field.fieldId];
        if (
          value === undefined ||
          value === null ||
          value === '' ||
          (field.type === 'checkbox' && value === false)
        ) {
          errors[field.fieldId] = `${field.label} is required`;
        }
      }

      // Email validation
      if (
        field.type === 'email' &&
        responses[field.fieldId] &&
        typeof responses[field.fieldId] === 'string'
      ) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(responses[field.fieldId] as string)) {
          errors[field.fieldId] = 'Please enter a valid email address';
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [form, responses]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form || !validate()) return;

      setSubmitting(true);

      try {
        const res = await fetch(`/api/forms/${form._id}/submissions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            responses,
            submittedBy: submitterName.trim() || 'Anonymous',
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          showToast(data.error || 'Failed to submit form', 'error');
          setSubmitting(false);
          return;
        }

        setSubmitted(true);
      } catch {
        showToast('Network error. Please try again.', 'error');
      } finally {
        setSubmitting(false);
      }
    },
    [form, validate, responses, submitterName, showToast]
  );

  const renderField = useCallback(
    (field: FormField) => {
      const hasError = !!validationErrors[field.fieldId];
      const baseInputClasses = `w-full px-4 py-3 rounded-lg border ${
        hasError
          ? 'border-red-400 dark:border-red-500 focus:ring-red-400'
          : 'border-slate-300 dark:border-slate-600 focus:ring-primary'
      } bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:border-transparent outline-none transition text-base`;

      switch (field.type) {
        case 'text':
        case 'email':
        case 'phone':
        case 'number':
          return (
            <input
              type={field.type === 'phone' ? 'tel' : field.type}
              id={field.fieldId}
              placeholder={field.placeholder || ''}
              value={(responses[field.fieldId] as string) || ''}
              onChange={(e) => updateResponse(field.fieldId, e.target.value)}
              className={baseInputClasses}
            />
          );

        case 'textarea':
          return (
            <textarea
              id={field.fieldId}
              placeholder={field.placeholder || ''}
              value={(responses[field.fieldId] as string) || ''}
              onChange={(e) => updateResponse(field.fieldId, e.target.value)}
              rows={4}
              className={baseInputClasses}
            />
          );

        case 'date':
          return (
            <input
              type="date"
              id={field.fieldId}
              value={(responses[field.fieldId] as string) || ''}
              onChange={(e) => updateResponse(field.fieldId, e.target.value)}
              className={baseInputClasses}
            />
          );

        case 'dropdown':
          return (
            <div className="relative">
              <select
                id={field.fieldId}
                value={(responses[field.fieldId] as string) || ''}
                onChange={(e) => updateResponse(field.fieldId, e.target.value)}
                className={`${baseInputClasses} appearance-none pr-10`}
              >
                <option value="">
                  {field.placeholder || 'Select an option'}
                </option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          );

        case 'radio':
          return (
            <div className="space-y-2">
              {field.options.map((opt) => (
                <label
                  key={opt}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary cursor-pointer transition"
                >
                  <input
                    type="radio"
                    name={field.fieldId}
                    value={opt}
                    checked={responses[field.fieldId] === opt}
                    onChange={() => updateResponse(field.fieldId, opt)}
                    className="w-4 h-4 text-primary focus:ring-primary border-slate-300"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">
                    {opt}
                  </span>
                </label>
              ))}
            </div>
          );

        case 'checkbox':
          return (
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-primary dark:hover:border-primary cursor-pointer transition">
              <input
                type="checkbox"
                checked={!!responses[field.fieldId]}
                onChange={(e) =>
                  updateResponse(field.fieldId, e.target.checked)
                }
                className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-slate-700 dark:text-slate-200">
                {field.placeholder || field.label}
              </span>
            </label>
          );

        case 'file':
          return (
            <div
              className={`relative flex items-center gap-3 p-4 rounded-lg border-2 border-dashed ${
                hasError
                  ? 'border-red-400 dark:border-red-500'
                  : 'border-slate-300 dark:border-slate-600'
              } bg-slate-50 dark:bg-slate-800/50 hover:border-primary transition cursor-pointer`}
            >
              <Upload size={20} className="text-slate-400" />
              <div className="flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {(responses[field.fieldId] as string) ||
                    'Click to upload or drag a file'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  File upload will be available after submission
                </p>
              </div>
              <input
                type="file"
                id={field.fieldId}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  updateResponse(field.fieldId, file?.name || '');
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          );

        default:
          return (
            <input
              type="text"
              id={field.fieldId}
              placeholder={field.placeholder || ''}
              value={(responses[field.fieldId] as string) || ''}
              onChange={(e) => updateResponse(field.fieldId, e.target.value)}
              className={baseInputClasses}
            />
          );
      }
    },
    [responses, validationErrors, updateResponse]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Loading form...
          </p>
        </div>
      </div>
    );
  }

  // Error states
  if (fetchError || !form) {
    const isExpired =
      fetchError?.includes('expired') || fetchError?.includes('maximum');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div
            className={`w-16 h-16 rounded-full ${
              isExpired
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-red-100 dark:bg-red-900/30'
            } flex items-center justify-center mx-auto mb-4`}
          >
            {isExpired ? (
              fetchError?.includes('maximum') ? (
                <Ban className="text-amber-500" size={32} />
              ) : (
                <Clock className="text-amber-500" size={32} />
              )
            ) : (
              <AlertCircle className="text-red-500" size={32} />
            )}
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-xl font-bold text-slate-800 dark:text-white mb-2">
            {isExpired ? 'Form Closed' : 'Form Not Available'}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            {fetchError || 'This form could not be found.'}
          </p>
        </Card>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-success flex items-center justify-center">
              <CheckCircle className="text-white" size={40} />
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-slate-800 dark:text-white mb-2">
            Submission Successful!
          </h1>
          <p className="text-slate-600 dark:text-slate-300 mb-2">
            Your response to{' '}
            <span className="font-semibold">{form.title}</span> has been
            recorded.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thank you for your submission. God bless you!
          </p>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              RCCG City Of Joy Fellowship
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="hero-gradient text-white py-8 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
            <FileText size={24} />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold mb-1">
            {form.title}
          </h1>
          {form.description && (
            <p className="text-blue-100 text-sm mt-2">{form.description}</p>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4 pb-8">
        {/* Expiry / Submissions Info */}
        {(form.expiresAt || form.maxSubmissions) && (
          <Card className="p-3 mb-4">
            <div className="flex flex-wrap gap-3 justify-center text-xs text-slate-500 dark:text-slate-400">
              {form.expiresAt && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>
                    Closes{' '}
                    {new Date(form.expiresAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {form.maxSubmissions && (
                <div className="flex items-center gap-1">
                  <FileText size={14} />
                  <span>
                    {form.submissionCount} / {form.maxSubmissions} responses
                  </span>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Submitter Name */}
              <div>
                <label
                  htmlFor="submitterName"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="submitterName"
                  placeholder="Enter your name (optional)"
                  value={submitterName}
                  onChange={(e) => setSubmitterName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition text-base"
                />
              </div>

              {/* Dynamic Fields */}
              {form.fields.map((field) => (
                <div key={field.fieldId}>
                  {field.type !== 'checkbox' && (
                    <label
                      htmlFor={field.fieldId}
                      className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2"
                    >
                      {field.label}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>
                  )}
                  {renderField(field)}
                  {validationErrors[field.fieldId] && (
                    <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle size={14} />
                      {validationErrors[field.fieldId]}
                    </p>
                  )}
                </div>
              ))}

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="w-full mt-2"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner size="sm" className="border-white border-t-transparent" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CheckCircle size={20} />
                    Submit Response
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          RCCG City Of Joy Fellowship &middot; Rivers Province 10
        </p>
      </div>
    </div>
  );
}
