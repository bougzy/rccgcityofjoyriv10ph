'use client';

import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { SERMON_CATEGORIES, MEDIA_DESTINATIONS } from '@/lib/constants/service-types';
import { formatFileSize } from '@/lib/utils/format';
import {
  Upload, FileVideo, FileAudio, ImageIcon, X, CloudUpload,
  User, BookOpen, Calendar, Film, Clock, Star,
} from 'lucide-react';

type MediaType = 'video' | 'audio' | 'image';

const QUALITY_OPTIONS = [
  { value: '480p', label: '480p (SD)' },
  { value: '720p', label: '720p (HD)' },
  { value: '1080p', label: '1080p (Full HD)' },
];

const mediaTypeIcons: Record<MediaType, React.ElementType> = {
  video: FileVideo,
  audio: FileAudio,
  image: ImageIcon,
};

export default function UploadPage() {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>('video');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const [form, setForm] = useState({
    title: '',
    preacher: '',
    category: 'sunday-service',
    description: '',
    bibleReference: '',
    date: new Date().toISOString().split('T')[0],
    quality: '720p',
    duration: '',
    featured: false,
    destinations: ['sermons'] as string[],
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDestinationToggle = (dest: string) => {
    setForm((prev) => ({
      ...prev,
      destinations: prev.destinations.includes(dest)
        ? prev.destinations.filter((d) => d !== dest)
        : [...prev.destinations, dest],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      showToast('Please select a file to upload', 'warning');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload file
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mediaType', mediaType);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadRes.json();
      setProgress(95);

      // Save sermon metadata
      const sermonRes = await fetch('/api/sermons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          mediaType,
          mediaUrl: uploadData.url || `/uploads/${selectedFile.name}`,
          thumbnailUrl: uploadData.thumbnailUrl || '',
        }),
      });

      if (!sermonRes.ok) {
        throw new Error('Failed to save sermon metadata');
      }

      setProgress(100);
      showToast('Upload successful! Sermon has been saved.', 'success');

      // Reset form
      setSelectedFile(null);
      setProgress(0);
      setForm({
        title: '',
        preacher: '',
        category: 'sunday-service',
        description: '',
        bibleReference: '',
        date: new Date().toISOString().split('T')[0],
        quality: '720p',
        duration: '',
        featured: false,
        destinations: ['sermons'],
      });
    } catch {
      showToast('Upload failed. Please try again.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const inputClasses =
    'w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Upload className="text-primary" size={24} />
          Upload Media
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Upload sermons, audio, and images to the church media library
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Upload zone + file type */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media type selection */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Media Type
              </h2>
              <div className="flex gap-3">
                {(['video', 'audio', 'image'] as MediaType[]).map((type) => {
                  const Icon = mediaTypeIcons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMediaType(type)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${
                        mediaType === type
                          ? 'border-primary bg-primary/10 text-primary dark:text-primary-light'
                          : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="capitalize">{type}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Drag and drop zone */}
            <Card className="p-6">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                  dragActive
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : selectedFile
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                    : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept={
                    mediaType === 'video'
                      ? 'video/*'
                      : mediaType === 'audio'
                      ? 'audio/*'
                      : 'image/*'
                  }
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                      {(() => {
                        const Icon = mediaTypeIcons[mediaType];
                        return <Icon size={24} className="text-green-600 dark:text-green-400" />;
                      })()}
                    </div>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedFile.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatFileSize(selectedFile.size)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                      }}
                      className="inline-flex items-center gap-1 text-sm text-red-500 hover:text-red-600 mt-2"
                    >
                      <X size={14} /> Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <CloudUpload size={40} className="mx-auto text-slate-400 dark:text-slate-500" />
                    <div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">
                        Drag and drop your file here
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Form fields */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                Media Details
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
                    placeholder="e.g., Walking in Divine Favor"
                    required
                    className={inputClasses}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      required
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Brief description of the sermon or media..."
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <BookOpen size={14} className="inline mr-1" /> Bible Reference
                    </label>
                    <input
                      type="text"
                      name="bibleReference"
                      value={form.bibleReference}
                      onChange={handleChange}
                      placeholder="e.g., Psalm 23:1-6"
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Calendar size={14} className="inline mr-1" /> Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={form.date}
                      onChange={handleChange}
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Quality
                    </label>
                    <select
                      name="quality"
                      value={form.quality}
                      onChange={handleChange}
                      className={inputClasses}
                    >
                      {QUALITY_OPTIONS.map((q) => (
                        <option key={q.value} value={q.value}>
                          {q.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      <Clock size={14} className="inline mr-1" /> Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={form.duration}
                      onChange={handleChange}
                      placeholder="e.g., 1:30:00"
                      className={inputClasses}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right column: Destinations + Featured + Submit */}
          <div className="space-y-6">
            {/* Destinations */}
            <Card className="p-6">
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Destinations
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Choose where this media should appear on the website
              </p>
              <div className="space-y-2">
                {MEDIA_DESTINATIONS.map((dest) => (
                  <label
                    key={dest.value}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.destinations.includes(dest.value)}
                      onChange={() => handleDestinationToggle(dest.value)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{dest.label}</span>
                  </label>
                ))}
              </div>
            </Card>

            {/* Featured toggle */}
            <Card className="p-6">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <Star size={18} className="text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Featured</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Display prominently on the homepage
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                />
              </label>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              disabled={uploading || !selectedFile}
              className="w-full"
              size="lg"
            >
              <Upload size={18} className="mr-2" />
              {uploading ? 'Uploading...' : 'Upload Media'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
