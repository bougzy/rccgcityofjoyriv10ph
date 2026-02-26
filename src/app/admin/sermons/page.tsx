'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/Toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatShortDate } from '@/lib/utils/format';
import {
  Music, Search, Trash2, Eye, Calendar, User, Film,
  AlertTriangle,
} from 'lucide-react';

interface Sermon {
  _id: string;
  title: string;
  preacher: string;
  category: string;
  date: string;
  mediaType: string;
  thumbnailUrl: string;
  views: number;
  destinations: string[];
  featured: boolean;
}

export default function SermonsPage() {
  const { showToast } = useToast();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSermons();
  }, []);

  const fetchSermons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sermons');
      if (res.ok) {
        const data = await res.json();
        setSermons(data);
      }
    } catch {
      showToast('Failed to load sermons', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sermons/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSermons((prev) => prev.filter((s) => s._id !== id));
        showToast('Sermon deleted successfully', 'success');
      } else {
        throw new Error('Delete failed');
      }
    } catch {
      showToast('Failed to delete sermon', 'error');
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const filteredSermons = sermons.filter(
    (sermon) =>
      sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sermon.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const destinationVariant = (dest: string) => {
    const map: Record<string, 'primary' | 'accent' | 'success' | 'info' | 'yaya' | 'warning'> = {
      sermons: 'primary',
      homepage: 'accent',
      gallery: 'success',
      events: 'info',
      yaya: 'yaya',
      about: 'warning',
    };
    return map[dest] || 'primary';
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Music className="text-primary" size={24} />
            Sermon Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage uploaded sermons and media content
          </p>
        </div>
        <a href="/admin/upload">
          <Button size="sm">
            <Film size={16} className="mr-2" />
            Upload New
          </Button>
        </a>
      </div>

      {/* Search bar */}
      <Card className="p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, preacher, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent placeholder-slate-400"
          />
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-primary" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">Loading sermons...</p>
          </div>
        </Card>
      ) : filteredSermons.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Music size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {searchQuery ? 'No sermons found' : 'No sermons uploaded yet'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different search.`
                : 'Upload your first sermon to get started.'}
            </p>
            {!searchQuery && (
              <a href="/admin/upload">
                <Button size="sm">Upload Sermon</Button>
              </a>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredSermons.map((sermon) => (
            <Card key={sermon._id} className="p-4">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                <div className="w-20 h-14 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  {sermon.thumbnailUrl ? (
                    <img
                      src={sermon.thumbnailUrl}
                      alt={sermon.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Music size={20} className="text-slate-400 dark:text-slate-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                        {sermon.title}
                        {sermon.featured && (
                          <span className="ml-2 text-amber-500 text-xs font-normal">(Featured)</span>
                        )}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <User size={12} /> {sermon.preacher}
                        </span>
                        <span className="flex items-center gap-1">
                          <Film size={12} /> {sermon.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {formatShortDate(sermon.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye size={12} /> {sermon.views.toLocaleString()} views
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {deleteConfirm === sermon._id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-red-500 flex items-center gap-1">
                            <AlertTriangle size={12} /> Delete?
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(sermon._id)}
                            disabled={deleting}
                          >
                            {deleting ? '...' : 'Yes'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            No
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm(sermon._id)}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={16} />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Destination badges */}
                  {sermon.destinations && sermon.destinations.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {sermon.destinations.map((dest) => (
                        <Badge key={dest} variant={destinationVariant(dest)}>
                          {dest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
