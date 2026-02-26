'use client';

import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  Calendar, Clock, MapPin, ArrowRight, Star, Users
} from 'lucide-react';

const featuredEvent = {
  title: 'Annual Church Conference 2025',
  date: 'March 14 - 16, 2025',
  time: '9:00 AM Daily',
  venue: 'RCCG City of Joy Parish, Port Harcourt',
  description:
    'Join us for three power-packed days of worship, teaching, and supernatural encounters. Our Annual Church Conference brings together ministers, believers, and seekers from across Rivers Province 10 and beyond for a time of spiritual renewal, prophetic impartation, and divine transformation. Come expecting miracles!',
  theme: 'Walking in the Fullness of God',
};

const upcomingEvents = [
  {
    id: 1,
    title: 'Monthly Thanksgiving Service',
    date: 'First Sunday',
    month: 'Every Month',
    time: '8:30 AM',
    location: 'Main Auditorium',
    description: 'A special time of gratitude and praise as we give thanks to God for His faithfulness throughout the month.',
  },
  {
    id: 2,
    title: 'Bible Study Marathon',
    date: 'Feb 20',
    month: '2025',
    time: '10:00 AM - 4:00 PM',
    location: 'Church Hall',
    description: 'An intensive day of deep-dive Bible study covering the book of Romans, with group discussions and interactive teaching.',
  },
  {
    id: 3,
    title: 'Youth Retreat',
    date: 'Apr 4 - 6',
    month: '2025',
    time: 'All Day',
    location: 'Camp Ground, PH',
    description: 'A weekend retreat for young people to connect with God, build friendships, and discover their purpose in Christ.',
  },
  {
    id: 4,
    title: 'Easter Convention',
    date: 'Apr 18 - 20',
    month: '2025',
    time: '7:00 AM Daily',
    location: 'Main Auditorium',
    description: 'Celebrate the resurrection of our Lord Jesus Christ with powerful worship, preaching, and fellowship during our Easter Convention.',
  },
  {
    id: 5,
    title: 'Workers Rally',
    date: 'May 10',
    month: '2025',
    time: '9:00 AM',
    location: 'Main Auditorium',
    description: 'A provincial gathering of all workers across Rivers Province 10 for training, encouragement, and commissioning for greater service.',
  },
  {
    id: 6,
    title: 'Community Outreach',
    date: 'Jun 7',
    month: '2025',
    time: '8:00 AM',
    location: 'Various Locations, PH',
    description: 'Join us as we reach out to our community with the love of Christ through free medical care, food distribution, and evangelism.',
  },
];

export default function EventsPage() {
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
            What&apos;s Happening
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Church Events
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Stay connected with everything happening at RCCG City of Joy. From special programs to community outreach, there&apos;s always something exciting going on.
          </p>
        </div>
      </section>

      {/* Featured Event */}
      <section className="py-20 bg-white dark:bg-slate-950 page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-fade-in-up stagger-1">
            <span className="section-badge">Featured Event</span>
          </div>
          <Card hover className="p-0 overflow-hidden animate-fade-in-up stagger-2">
            <div className="grid grid-cols-1 lg:grid-cols-5">
              {/* Left - Date highlight */}
              <div className="lg:col-span-2 hero-gradient p-8 lg:p-12 flex flex-col justify-center text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
                  <Star className="text-accent" size={20} />
                  <span className="text-accent font-semibold text-sm uppercase tracking-wider">Featured</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
                  {featuredEvent.title}
                </h2>
                <p className="text-blue-200 text-sm font-medium italic mb-6">
                  Theme: &ldquo;{featuredEvent.theme}&rdquo;
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-blue-100 justify-center lg:justify-start">
                    <Calendar size={16} className="shrink-0" />
                    <span className="text-sm">{featuredEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100 justify-center lg:justify-start">
                    <Clock size={16} className="shrink-0" />
                    <span className="text-sm">{featuredEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-3 text-blue-100 justify-center lg:justify-start">
                    <MapPin size={16} className="shrink-0" />
                    <span className="text-sm">{featuredEvent.venue}</span>
                  </div>
                </div>
              </div>

              {/* Right - Description */}
              <div className="lg:col-span-3 p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About This Event</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                  {featuredEvent.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm">
                    Register Now <ArrowRight size={16} />
                  </button>
                  <button className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light px-6 py-2.5 rounded-lg font-semibold transition-colors text-sm">
                    Add to Calendar
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Upcoming Events Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-3">
            <span className="section-badge">Mark Your Calendar</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Upcoming Events
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Don&apos;t miss out on these upcoming programs and activities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} hover className="p-6">
                {/* Date Badge */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="bg-primary/10 dark:bg-primary-light/10 rounded-xl p-3 text-center min-w-[60px]">
                    <p className="text-xs font-semibold text-primary dark:text-primary-light uppercase">{event.month}</p>
                    <p className="text-lg font-bold text-primary dark:text-primary-light leading-tight">{event.date}</p>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} className="text-accent shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={14} className="text-accent shrink-0" />
                    <span>{event.location}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                  {event.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Never Miss an Event
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Follow us on social media and stay connected with the latest happenings at RCCG City of Joy.
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Contact Us <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
