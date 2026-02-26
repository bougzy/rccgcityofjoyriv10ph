'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SERMON_CATEGORIES } from '@/lib/constants/service-types';
import { parseStreamUrl, generateEmbedUrl } from '@/lib/utils/url-parsers';
import {
  Radio, Link as LinkIcon, Play, Square, ExternalLink, AlertCircle,
  User, Film, FileText, Clock,
} from 'lucide-react';

export default function LivestreamPage() {
  const { showToast } = useToast();

  const [streamUrl, setStreamUrl] = useState('');
  const [parsedStream, setParsedStream] = useState<{ platform: string; videoId: string } | null>(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [parseError, setParseError] = useState('');

  const [form, setForm] = useState({
    title: '',
    preacher: '',
    category: 'sunday-service',
    description: '',
  });

  // Fetch current stream status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/livestream');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setIsLive(data.isLive || false);
            if (data.streamUrl) setStreamUrl(data.streamUrl);
            if (data.embedUrl) setEmbedUrl(data.embedUrl);
            if (data.platform && data.videoId) {
              setParsedStream({ platform: data.platform, videoId: data.videoId });
            }
            setForm({
              title: data.title || '',
              preacher: data.preacher || '',
              category: data.category || 'sunday-service',
              description: data.description || '',
            });
          }
        }
      } catch {
        // Status could not be loaded
      }
    };
    fetchStatus();
  }, []);

  const handleParseUrl = () => {
    setParseError('');

    if (!streamUrl.trim()) {
      setParseError('Please enter a stream URL');
      return;
    }

    const result = parseStreamUrl(streamUrl);
    if (!result) {
      setParseError('Could not parse URL. Please enter a valid YouTube or Facebook stream URL.');
      setParsedStream(null);
      setEmbedUrl('');
      return;
    }

    setParsedStream(result);
    const embed = generateEmbedUrl(result.platform, result.videoId);
    setEmbedUrl(embed);
    showToast(`${result.platform === 'youtube' ? 'YouTube' : 'Facebook'} stream detected`, 'success');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoLive = async () => {
    if (!parsedStream) {
      showToast('Please parse a stream URL first', 'warning');
      return;
    }

    if (!form.title.trim()) {
      showToast('Please enter a stream title', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/livestream', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLive: true,
          platform: parsedStream.platform,
          videoId: parsedStream.videoId,
          streamUrl,
          embedUrl,
          ...form,
        }),
      });

      if (!res.ok) throw new Error('Failed to go live');

      setIsLive(true);
      showToast('Stream is now LIVE!', 'success');
    } catch {
      showToast('Failed to start stream', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStopStream = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/livestream', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isLive: false,
        }),
      });

      if (!res.ok) throw new Error('Failed to stop stream');

      setIsLive(false);
      showToast('Stream has been stopped', 'info');
    } catch {
      showToast('Failed to stop stream', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Radio className="text-primary" size={24} />
            Livestream Manager
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage live streaming for church services
          </p>
        </div>

        {/* Status indicator */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
          isLive
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
          {isLive ? 'LIVE' : 'Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: URL + Preview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stream URL input */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <LinkIcon size={16} /> Stream URL
            </h2>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={streamUrl}
                  onChange={(e) => {
                    setStreamUrl(e.target.value);
                    setParseError('');
                  }}
                  placeholder="https://youtube.com/watch?v=... or https://facebook.com/.../videos/..."
                  className={`${inputClasses} pl-10`}
                />
              </div>
              <Button type="button" onClick={handleParseUrl} variant="outline">
                Parse URL
              </Button>
            </div>
            {parseError && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} /> {parseError}
              </p>
            )}
            {parsedStream && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <span className="capitalize font-medium">{parsedStream.platform}</span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-500 dark:text-slate-400">ID: {parsedStream.videoId}</span>
              </div>
            )}
          </Card>

          {/* Preview area */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Play size={16} /> Stream Preview
            </h2>
            {embedUrl ? (
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Stream preview"
                />
              </div>
            ) : (
              <div className="aspect-video rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600">
                <div className="text-center">
                  <Radio size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Enter a YouTube or Facebook URL and click &quot;Parse URL&quot; to preview
                  </p>
                </div>
              </div>
            )}
          </Card>

          {/* Past streams placeholder */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Clock size={16} /> Past Streams
            </h2>
            <div className="text-center py-8">
              <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Past stream history will appear here
              </p>
            </div>
          </Card>
        </div>

        {/* Right column: Stream info + Controls */}
        <div className="space-y-6">
          {/* Stream info fields */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Stream Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Film size={14} className="inline mr-1" /> Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Sunday Service Live"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <User size={14} className="inline mr-1" /> Preacher
                </label>
                <input
                  type="text"
                  name="preacher"
                  value={form.preacher}
                  onChange={handleChange}
                  placeholder="e.g., Pastor E.A. Adeboye"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  {SERMON_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <FileText size={14} className="inline mr-1" /> Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Brief description of the stream..."
                  className={`${inputClasses} resize-none`}
                />
              </div>
            </div>
          </Card>

          {/* Controls */}
          <Card className="p-6">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
              Stream Controls
            </h2>
            <div className="space-y-3">
              {!isLive ? (
                <Button
                  onClick={handleGoLive}
                  disabled={loading || !parsedStream}
                  className="w-full"
                  size="lg"
                >
                  <Play size={18} className="mr-2" />
                  {loading ? 'Starting...' : 'Go Live'}
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={handleStopStream}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  <Square size={18} className="mr-2" />
                  {loading ? 'Stopping...' : 'Stop Stream'}
                </Button>
              )}

              {!parsedStream && !isLive && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  Parse a stream URL above to enable the Go Live button
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
