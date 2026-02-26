'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  Play, Search, Filter, Calendar, Eye, Clock, User, ChevronDown
} from 'lucide-react';

const categories = ['All', 'Sunday Service', 'Bible Study', 'Special Program', 'Youth Service', 'Prayer Meeting'];

const sermons = [
  {
    id: 1,
    title: 'Walking in Purpose',
    preacher: 'Pastor Solomon Marega',
    date: 'January 12, 2025',
    category: 'Sunday Service',
    duration: '58 min',
    views: 1243,
  },
  {
    id: 2,
    title: 'The Power of Faith',
    preacher: 'Pastor Solomon Marega',
    date: 'January 5, 2025',
    category: 'Sunday Service',
    duration: '45 min',
    views: 987,
  },
  {
    id: 3,
    title: 'Unlocking Your Destiny',
    preacher: 'Pastor Solomon Marega',
    date: 'December 29, 2024',
    category: 'Special Program',
    duration: '1 hr 12 min',
    views: 2105,
  },
  {
    id: 4,
    title: 'The Grace to Stand',
    preacher: 'Guest Minister',
    date: 'December 22, 2024',
    category: 'Sunday Service',
    duration: '52 min',
    views: 756,
  },
  {
    id: 5,
    title: 'Foundations of Prayer',
    preacher: 'Pastor Solomon Marega',
    date: 'December 15, 2024',
    category: 'Bible Study',
    duration: '40 min',
    views: 634,
  },
  {
    id: 6,
    title: 'Living Beyond Limits',
    preacher: 'Pastor Solomon Marega',
    date: 'December 8, 2024',
    category: 'Youth Service',
    duration: '47 min',
    views: 891,
  },
];

export default function SermonsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  const filteredSermons = sermons
    .filter((sermon) => {
      const matchesSearch =
        sermon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sermon.preacher.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || sermon.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="hero-gradient relative min-h-[400px] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <span className="inline-block bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            The Word of God
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Sermon Library
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Explore our collection of anointed sermons and teachings. Be inspired, equipped, and transformed by the Word of God.
          </p>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="py-8 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center animate-fade-in-up stagger-1">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search sermons by title or preacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div className="relative w-full sm:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {/* Sort */}
            <div className="relative w-full sm:w-auto">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
                className="w-full sm:w-40 pl-9 pr-8 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-colors"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Cards Grid */}
      <section className="py-16 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredSermons.length === 0 ? (
            <div className="text-center py-20">
              <Search className="text-slate-300 dark:text-slate-600 mx-auto mb-4" size={48} />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No sermons found</h3>
              <p className="text-slate-600 dark:text-slate-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-2">
              {filteredSermons.map((sermon) => (
                <Card key={sermon.id} hover className="p-6">
                  {/* Thumbnail placeholder */}
                  <div className="relative bg-primary/10 dark:bg-primary-light/10 rounded-lg h-40 flex items-center justify-center mb-4 group cursor-pointer">
                    <div className="w-14 h-14 bg-primary/20 dark:bg-primary-light/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 dark:group-hover:bg-primary-light/30 transition-colors">
                      <Play className="text-primary dark:text-primary-light ml-1" size={24} />
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                      <Clock size={10} /> {sermon.duration}
                    </span>
                  </div>

                  {/* Category badge */}
                  <span className="inline-block bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">
                    {sermon.category}
                  </span>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {sermon.title}
                  </h3>

                  {/* Preacher */}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <User size={14} />
                    <span>{sermon.preacher}</span>
                  </div>

                  {/* Date & Views */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {sermon.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye size={12} /> {sermon.views.toLocaleString()} views
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Load More */}
          {filteredSermons.length > 0 && (
            <div className="text-center mt-12">
              <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                Load More Sermons
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
