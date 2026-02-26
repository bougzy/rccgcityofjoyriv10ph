'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { Activity, Plus, Minus, RotateCcw, Power, PowerOff, Edit3 } from 'lucide-react';

export default function LiveCounterPage() {
  const { showToast } = useToast();
  const [count, setCount] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [label, setLabel] = useState('Live Attendance');
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelInput, setLabelInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchCounter = useCallback(async () => {
    try {
      const res = await fetch('/api/live-counter');
      if (res.ok) {
        const data = await res.json();
        setCount(data.count || 0);
        setIsActive(data.isActive || false);
        setLabel(data.label || 'Live Attendance');
      }
    } catch {
      // Silently fail on poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCounter();
  }, [fetchCounter]);

  // Auto-refresh every 5 seconds when active
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(fetchCounter, 5000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, fetchCounter]);

  const sendAction = async (body: Record<string, unknown>) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/live-counter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setCount(data.count ?? count);
        if (data.isActive !== undefined) setIsActive(data.isActive);
        if (data.label) setLabel(data.label);
      } else {
        showToast('Action failed', 'error');
      }
    } catch {
      showToast('Connection error', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleIncrement = () => sendAction({ action: 'increment' });
  const handleDecrement = () => {
    if (count > 0) sendAction({ action: 'decrement' });
  };
  const handleReset = () => {
    if (confirm('Reset counter to 0?')) sendAction({ action: 'reset' });
  };
  const handleToggleActive = () => sendAction({ isActive: !isActive });
  const handleSaveLabel = () => {
    if (labelInput.trim()) {
      sendAction({ label: labelInput.trim() });
      setEditingLabel(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto page-enter">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2 font-[family-name:var(--font-playfair)]">
          <Activity className="text-primary" size={24} />
          Live Counter
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Real-time attendance tracking for services
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex justify-center">
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
          isActive
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
          {isActive ? 'LIVE' : 'INACTIVE'}
        </span>
      </div>

      {/* Label */}
      <div className="text-center">
        {editingLabel ? (
          <div className="flex items-center justify-center gap-2">
            <input
              type="text"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
              autoFocus
            />
            <Button size="sm" onClick={handleSaveLabel}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingLabel(false)}>Cancel</Button>
          </div>
        ) : (
          <button
            onClick={() => { setLabelInput(label); setEditingLabel(true); }}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm"
          >
            {label} <Edit3 size={12} />
          </button>
        )}
      </div>

      {/* Counter Display */}
      <Card className="p-12">
        <div className="flex items-center justify-center gap-6 sm:gap-12">
          {/* Decrement */}
          <button
            onClick={handleDecrement}
            disabled={actionLoading || count === 0}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Minus size={32} />
          </button>

          {/* Count */}
          <div className="text-center animate-pulse-glow">
            <p className="text-7xl sm:text-8xl font-bold text-slate-900 dark:text-white tabular-nums leading-none">
              {count.toLocaleString()}
            </p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">people</p>
          </div>

          {/* Increment */}
          <button
            onClick={handleIncrement}
            disabled={actionLoading}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Plus size={32} />
          </button>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button
          onClick={handleToggleActive}
          variant={isActive ? 'danger' : 'primary'}
          disabled={actionLoading}
        >
          {isActive ? <><PowerOff size={16} className="mr-1.5" /> Stop Counter</> : <><Power size={16} className="mr-1.5" /> Start Counter</>}
        </Button>
        <Button onClick={handleReset} variant="outline" disabled={actionLoading || count === 0}>
          <RotateCcw size={16} className="mr-1.5" /> Reset
        </Button>
      </div>

      {/* Info */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        Counter auto-refreshes every 5 seconds when active. Designed for tablet use at church entrance.
      </p>
    </div>
  );
}
