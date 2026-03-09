'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Store, MessageCircle, CheckCircle, ArrowLeft,
  AlertCircle, Phone, FileText, CreditCard, Info,
} from 'lucide-react';

const STEPS = [
  { label: 'Store Info', icon: Store },
  { label: 'Contact', icon: Phone },
  { label: 'Payment', icon: CreditCard },
  { label: 'Review', icon: FileText },
];

export default function ApplyStorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    storeName: '',
    description: '',
    category: 'general',
    whatsappNumber: '',
    setupFeeProof: '',
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-200 dark:border-slate-700">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-4" />
          <h2 className="font-bold text-slate-900 dark:text-white text-xl mb-2">Login Required</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">You must be logged in to apply for a store.</p>
          <Link href="/login" className="block w-full bg-primary text-white font-semibold py-3 rounded-xl text-sm text-center hover:bg-primary-dark transition-colors">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
          </div>
          <h2 className="font-bold text-slate-900 dark:text-white text-xl mb-2">Application Submitted!</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">
            Your store application is now under review by the super admin.
          </p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mb-6">
            You will be contacted once your application is reviewed. This typically takes 1–3 business days.
          </p>
          <Link href="/marketplace" className="block w-full bg-primary text-white font-semibold py-3 rounded-xl text-sm text-center hover:bg-primary-dark transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 mb-6 transition-colors">
          <ArrowLeft size={16} /> Back to Marketplace
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Top gradient */}
          <div className="bg-gradient-to-br from-primary to-blue-600 px-6 py-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Store size={22} />
              <h1 className="text-xl font-bold">Open a Store</h1>
            </div>
            <p className="text-blue-100 text-sm">Sell to the church community through WhatsApp</p>
          </div>

          {/* Progress steps */}
          <div className="flex border-b border-slate-100 dark:border-slate-700">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${i === step ? 'text-primary dark:text-blue-400 border-b-2 border-primary dark:border-blue-400' : i < step ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  <Icon size={16} className="mb-1" />
                  {s.label}
                </div>
              );
            })}
          </div>

          <div className="p-6">
            {error && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/40 text-red-700 dark:text-red-400 rounded-xl px-4 py-3 text-sm mb-5">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Step 0: Store Info */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Store Name *</label>
                  <input
                    type="text"
                    value={form.storeName}
                    onChange={(e) => update('storeName', e.target.value)}
                    placeholder="e.g. Grace Kitchen, Faith Boutique"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary dark:focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="general">General</option>
                    <option value="food-beverages">Food & Beverages</option>
                    <option value="clothing-fashion">Clothing & Fashion</option>
                    <option value="books-media">Books & Media</option>
                    <option value="electronics">Electronics</option>
                    <option value="beauty-health">Beauty & Health</option>
                    <option value="services">Services</option>
                    <option value="crafts-handmade">Crafts & Handmade</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Store Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Describe what your store sells and your vision..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 1: Contact */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 rounded-xl p-4 flex gap-3">
                  <MessageCircle size={18} className="text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-300">
                    <p className="font-semibold mb-1">WhatsApp is your checkout method</p>
                    <p className="text-green-700 dark:text-green-400">Customers will contact you directly on WhatsApp when they want to purchase a product. Make sure this number is active and has WhatsApp.</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">WhatsApp Number *</label>
                  <input
                    type="tel"
                    value={form.whatsappNumber}
                    onChange={(e) => update('whatsappNumber', e.target.value)}
                    placeholder="e.g. +2348012345678"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Include country code (e.g. +234 for Nigeria)</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Account Details</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{session.user?.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-500">{session.user?.email}</p>
                </div>
              </div>
            )}

            {/* Step 2: Payment info */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard size={18} className="text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Setup Fee: ₦5,000</span>
                  </div>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    A one-time setup fee is required to open your store. This covers admin review, store setup, and maintenance. Payment must be made before approval.
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Payment Details</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Bank Name</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">First Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Account Number</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Account Name</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">RCCG City of Joy Family</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Payment Proof (Screenshot URL or reference)</label>
                  <input
                    type="text"
                    value={form.setupFeeProof}
                    onChange={(e) => update('setupFeeProof', e.target.value)}
                    placeholder="Paste payment screenshot URL or transaction reference"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div className="flex gap-2 items-start text-xs text-slate-500 dark:text-slate-400">
                  <Info size={13} className="shrink-0 mt-0.5" />
                  Your store will only be activated after the admin confirms receipt of payment and approves your application.
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Review Your Application</h3>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Store Name', value: form.storeName },
                    { label: 'Category', value: form.category },
                    { label: 'Description', value: form.description },
                    { label: 'WhatsApp', value: form.whatsappNumber },
                    { label: 'Payment Proof', value: form.setupFeeProof || '(Not provided)' },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-3 py-2.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                      <span className="text-slate-500 dark:text-slate-400 w-32 shrink-0">{item.label}</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium break-all">{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/40 rounded-xl px-4 py-3 text-xs text-blue-700 dark:text-blue-400">
                  By submitting, you agree that your store will be visible to all church members and that you will honour all purchases contacted via WhatsApp.
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={step === 0}
                className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>

              {step < 3 ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={
                    (step === 0 && (!form.storeName || !form.description)) ||
                    (step === 1 && !form.whatsappNumber)
                  }
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Continue
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}