'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Youtube, Facebook, Film, Save, RefreshCw } from 'lucide-react';

interface SiteSettings {
  youtubeChannelId: string;
  facebookPageId: string;
  defaultQuality: string;
}

const QUALITY_OPTIONS = [
  { value: '480p', label: '480p (SD)' },
  { value: '720p', label: '720p (HD)' },
  { value: '1080p', label: '1080p (Full HD)' },
];

export default function SettingsPage() {
  const { showToast } = useToast();

  const [settings, setSettings] = useState<SiteSettings>({
    youtubeChannelId: '',
    facebookPageId: '',
    defaultQuality: '720p',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSettings({
            youtubeChannelId: data.youtubeChannelId || '',
            facebookPageId: data.facebookPageId || '',
            defaultQuality: data.defaultQuality || '720p',
          });
        }
      }
    } catch {
      // Settings could not be loaded, using defaults
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save settings');

      showToast('Settings saved successfully', 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inputClasses =
    'w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent';

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="text-primary" size={24} />
            Settings
          </h1>
        </div>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading settings...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="text-primary" size={24} />
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Configure site-wide settings and integrations
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
        {/* Social Media Integration */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Social Media Integration
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Connect your YouTube and Facebook accounts for live streaming and media sharing
          </p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Youtube size={14} className="inline mr-1 text-red-500" />
                YouTube Channel ID
              </label>
              <input
                type="text"
                name="youtubeChannelId"
                value={settings.youtubeChannelId}
                onChange={handleChange}
                placeholder="e.g., UCxxxxxxxxxxxxxxxxxx"
                className={inputClasses}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Found in your YouTube channel settings under &quot;Advanced settings&quot;
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                <Facebook size={14} className="inline mr-1 text-blue-600" />
                Facebook Page ID
              </label>
              <input
                type="text"
                name="facebookPageId"
                value={settings.facebookPageId}
                onChange={handleChange}
                placeholder="e.g., 123456789012345"
                className={inputClasses}
              />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Found in your Facebook Page &quot;About&quot; section under &quot;Page transparency&quot;
              </p>
            </div>
          </div>
        </Card>

        {/* Media Settings */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
            Media Settings
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Default settings for media uploads and playback
          </p>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <Film size={14} className="inline mr-1" />
              Default Video Quality
            </label>
            <select
              name="defaultQuality"
              value={settings.defaultQuality}
              onChange={handleChange}
              className={inputClasses}
            >
              {QUALITY_OPTIONS.map((q) => (
                <option key={q.value} value={q.value}>
                  {q.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              This quality will be pre-selected when uploading new media
            </p>
          </div>
        </Card>

        {/* Current settings display */}
        <Card className="p-6 bg-slate-50 dark:bg-slate-800/50">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Current Settings
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">YouTube Channel ID:</span>
              <span className="text-slate-900 dark:text-white font-mono text-xs">
                {settings.youtubeChannelId || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Facebook Page ID:</span>
              <span className="text-slate-900 dark:text-white font-mono text-xs">
                {settings.facebookPageId || 'Not set'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Default Quality:</span>
              <span className="text-slate-900 dark:text-white">
                {settings.defaultQuality}
              </span>
            </div>
          </div>
        </Card>

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving} size="lg">
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={fetchSettings}
          >
            <RefreshCw size={18} className="mr-2" />
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
