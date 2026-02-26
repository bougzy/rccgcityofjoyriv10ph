'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  ChevronLeft, ChevronRight, Play, BookOpen, Users, Heart,
  Music, Calendar, Clock, MapPin, ArrowRight, Wifi,
  HandHeart, Sparkles, Mic2, Star
} from 'lucide-react';

interface SermonItem {
  _id: string; title: string; preacher: string; date: string; category: string;
  audioUrl?: string; videoUrl?: string; youtubeVideoId?: string;
}

interface EventItem {
  _id: string; title: string; startDate: string; endDate?: string; venue: string;
  eventType: string; startTime?: string;
}

interface DevotionalItem {
  _id: string; title: string; date: string; scripture: string; body: string; author: string;
}

interface TestimonyItem {
  _id: string; title: string; body: string; authorName: string; category: string;
}

const heroSlides = [
  {
    badge: 'Welcome to City of Joy',
    title: 'Experience God\'s Love & Joy',
    subtitle: 'Join us for life-transforming worship and fellowship at RCCG City of Joy Parish',
    cta: { href: '/about', label: 'Learn More' },
    image: '/img/hero/hero-1.jpg',
  },
  {
    badge: 'Rivers Province 10 Headquarters',
    title: 'A Place of Divine Encounters',
    subtitle: 'Where lives are changed, hope is restored, and destinies are fulfilled through the power of God',
    cta: { href: '/sermons', label: 'Watch Sermons' },
    image: '/img/hero/hero-2.jpg',
  },
  {
    badge: 'Join Our Community',
    title: 'Growing Together in Faith',
    subtitle: 'Be part of a vibrant community of believers committed to serving God and making a difference',
    cta: { href: '/ministries', label: 'Get Involved' },
    image: '/img/hero/hero-3.jpg',
  },
];

const weeklyActivities = [
  { day: 'Sunday', time: '7:00 AM', title: 'Workers Meeting', icon: Users, desc: 'Preparation and prayer for workers' },
  { day: 'Sunday', time: '8:30 AM', title: 'Sunday School', icon: BookOpen, desc: 'Study the word together' },
  { day: 'Sunday', time: '9:30 AM', title: 'Main Service', icon: Music, desc: 'Worship and the Word' },
  { day: 'Tuesday', time: '5:30 PM', title: 'Digging Deep', icon: BookOpen, desc: 'In-depth Bible study' },
  { day: 'Thursday', time: '5:30 PM', title: 'Faith Clinic', icon: Heart, desc: 'Healing and deliverance' },
  { day: '3rd Saturday', time: '6:00 PM', title: 'Divine Visitation', icon: Calendar, desc: 'Special monthly program' },
];

const ministries = [
  { title: 'Worship & Music', desc: 'Leading the church in praise and worship through anointed music ministry.', icon: Music },
  { title: 'Youth & Young Adults', desc: 'Empowering the next generation to live purposeful lives for Christ.', icon: Users },
  { title: 'Children Ministry', desc: 'Nurturing young hearts to know and love God from an early age.', icon: Heart },
  { title: 'Prayer Ministry', desc: 'Interceding for the church, community, and the nations.', icon: BookOpen },
  { title: 'Evangelism', desc: 'Reaching out to the lost and bringing them to the saving knowledge of Christ.', icon: MapPin },
  { title: 'Welfare', desc: 'Caring for the needs of members and the community through love in action.', icon: Heart },
];

const scriptures = [
  '"For I know the plans I have for you," declares the LORD, "plans to prosper you..." — Jeremiah 29:11',
  '"The joy of the LORD is your strength." — Nehemiah 8:10',
  '"I can do all things through Christ who strengthens me." — Philippians 4:13',
  '"Trust in the LORD with all your heart..." — Proverbs 3:5',
  '"Be strong and courageous. Do not be afraid..." — Joshua 1:9',
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scriptureIdx, setScriptureIdx] = useState(0);
  const [latestSermons, setLatestSermons] = useState<SermonItem[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [devotional, setDevotional] = useState<DevotionalItem | null>(null);
  const [testimonies, setTestimonies] = useState<TestimonyItem[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setScriptureIdx((p) => (p + 1) % scriptures.length), 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch('/api/sermons?limit=3').then(r => r.ok ? r.json() : []).then(setLatestSermons).catch(() => {});
    fetch('/api/events?upcoming=true&limit=4').then(r => r.ok ? r.json() : []).then(setUpcomingEvents).catch(() => {});
    fetch('/api/devotionals/today').then(r => r.ok ? r.json() : null).then(setDevotional).catch(() => {});
    fetch('/api/testimonies?approved=true&featured=true&limit=3').then(r => r.ok ? r.json() : []).then(setTestimonies).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center pt-16 overflow-hidden">
        {/* Background image carousel */}
        {heroSlides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              i === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

        {/* Decorative blurs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { w: 6, left: '10%', bottom: '-5%', dur: '8s', delay: '0s', type: 'rise', color: 'bg-white/60' },
            { w: 4, left: '20%', bottom: '-5%', dur: '12s', delay: '2s', type: 'drift', color: 'bg-amber-300/50' },
            { w: 8, left: '35%', bottom: '-5%', dur: '10s', delay: '1s', type: 'rise', color: 'bg-white/45' },
            { w: 5, left: '45%', bottom: '-5%', dur: '14s', delay: '4s', type: 'drift', color: 'bg-blue-300/50' },
            { w: 6, left: '55%', bottom: '-5%', dur: '9s', delay: '3s', type: 'rise', color: 'bg-white/55' },
            { w: 4, left: '65%', bottom: '-5%', dur: '11s', delay: '0.5s', type: 'drift', color: 'bg-amber-300/45' },
            { w: 7, left: '75%', bottom: '-5%', dur: '13s', delay: '5s', type: 'rise', color: 'bg-white/50' },
            { w: 5, left: '85%', bottom: '-5%', dur: '10s', delay: '2.5s', type: 'drift', color: 'bg-blue-300/55' },
            { w: 8, left: '25%', bottom: '-5%', dur: '15s', delay: '6s', type: 'rise', color: 'bg-white/40' },
            { w: 4, left: '50%', bottom: '-5%', dur: '11s', delay: '7s', type: 'drift', color: 'bg-amber-300/45' },
            { w: 6, left: '70%', bottom: '-5%', dur: '9s', delay: '1.5s', type: 'rise', color: 'bg-white/55' },
            { w: 5, left: '15%', bottom: '-5%', dur: '13s', delay: '3.5s', type: 'drift', color: 'bg-blue-300/50' },
          ].map((p, i) => (
            <span
              key={i}
              className={`hero-particle hero-particle--${p.type} ${p.color}`}
              style={{
                width: `${p.w}px`,
                height: `${p.w}px`,
                left: p.left,
                bottom: p.bottom,
                animationDuration: p.dur,
                animationDelay: p.delay,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          {heroSlides.map((slide, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ${
                i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 absolute inset-0 flex items-center pointer-events-none'
              }`}
            >
              {i === currentSlide && (
                <div className="max-w-2xl">
                  <span className="inline-block bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                    {slide.badge}
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)] drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-lg text-amber-100 mb-8 leading-relaxed drop-shadow-md">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href={slide.cta.href}
                      className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg"
                    >
                      {slide.cta.label} <ArrowRight size={18} />
                    </Link>
                    <Link
                      href="/sermons"
                      className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors border border-white/20"
                    >
                      <Play size={18} /> Watch Live
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Slide indicators */}
          <div className="flex items-center gap-3 mt-12">
            <button onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)} className="p-2 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-colors border border-white/10">
              <ChevronLeft size={18} />
            </button>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-8 bg-accent shadow-lg shadow-accent/30' : 'w-2 bg-white/40'}`} />
            ))}
            <button onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)} className="p-2 rounded-full bg-white/15 text-white hover:bg-white/25 backdrop-blur-sm transition-colors border border-white/10">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Welcome</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Welcome to City Of Joy
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We are a vibrant community of believers dedicated to worshipping God, growing in faith, and making a positive impact in our world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up stagger-2">
            {[
              { icon: BookOpen, title: 'Biblical Teaching', desc: 'Sound biblical teaching that transforms lives and builds strong faith foundations.' },
              { icon: Users, title: 'Loving Community', desc: 'A warm and welcoming church family where everyone belongs and is valued.' },
              { icon: Heart, title: 'Outreach & Impact', desc: 'Reaching out to our community and the world with the love of Jesus Christ.' },
            ].map((item) => (
              <Card key={item.title} hover className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-primary dark:text-primary-light" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Weekly Activities */}
      <section className="py-20 bg-white dark:bg-slate-950 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Schedule</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Weekly Activities
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Join us throughout the week for worship, study, and fellowship</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-3">
            {weeklyActivities.map((activity) => (
              <Card key={activity.title} hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-xl flex items-center justify-center shrink-0">
                    <activity.icon className="text-primary dark:text-primary-light" size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-accent bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">{activity.day}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400"><Clock size={12} /> {activity.time}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{activity.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{activity.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Ministries */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Get Involved</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">Our Ministries</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Discover how you can serve and grow in our church</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-4">
            {ministries.map((m) => (
              <Card key={m.title} hover className="p-6">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-xl flex items-center justify-center mb-4">
                  <m.icon className="text-primary dark:text-primary-light" size={22} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{m.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{m.desc}</p>
              </Card>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/ministries" className="inline-flex items-center gap-2 text-primary dark:text-primary-light hover:underline font-semibold">
              View All Ministries <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Scripture Ticker */}
      <section className="bg-primary dark:bg-blue-950 py-3 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <BookOpen className="text-amber-300 shrink-0 mr-3" size={18} />
          <p className="text-blue-100 text-sm transition-opacity duration-500">{scriptures[scriptureIdx]}</p>
        </div>
      </section>

      {/* Latest Sermons */}
      {latestSermons.length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-badge">Listen</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 font-[family-name:var(--font-playfair)]">Latest Sermons</h2>
              </div>
              <Link href="/sermons" className="inline-flex items-center gap-1 text-primary dark:text-primary-light hover:underline font-semibold text-sm">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestSermons.map((s) => (
                <Card key={s._id} hover className="p-6">
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary-light/10 rounded-xl flex items-center justify-center mb-3">
                    <Mic2 className="text-primary dark:text-primary-light" size={20} />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{s.preacher}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-badge">What&apos;s Coming</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 font-[family-name:var(--font-playfair)]">Upcoming Events</h2>
              </div>
              <Link href="/events" className="inline-flex items-center gap-1 text-primary dark:text-primary-light hover:underline font-semibold text-sm">
                All Events <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {upcomingEvents.map((e) => {
                const d = new Date(e.startDate);
                return (
                  <Card key={e._id} hover className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-xl flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-accent uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-lg font-bold text-accent leading-none">{d.getDate()}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2">{e.title}</h3>
                        {e.startTime && <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5"><Clock size={10} /> {e.startTime}</p>}
                      </div>
                    </div>
                    {e.venue && <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MapPin size={10} /> {e.venue}</p>}
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Daily Devotional */}
      {devotional && (
        <section className="py-16 bg-white dark:bg-slate-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <span className="section-badge">Daily Word</span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 font-[family-name:var(--font-playfair)]">Today&apos;s Devotional</h2>
            </div>
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 font-[family-name:var(--font-playfair)]">{devotional.title}</h3>
              {devotional.scripture && <p className="text-sm text-accent font-semibold mb-4 italic">{devotional.scripture}</p>}
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">{devotional.body}</p>
              {devotional.author && <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">— {devotional.author}</p>}
              <Link href={`/devotionals/${devotional._id}`} className="inline-flex items-center gap-1 text-primary dark:text-primary-light hover:underline font-semibold text-sm mt-4">
                Read Full Devotional <ArrowRight size={14} />
              </Link>
            </Card>
          </div>
        </section>
      )}

      {/* Featured Testimonies */}
      {testimonies.length > 0 && (
        <section className="py-16 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-badge">Praise Reports</span>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3 font-[family-name:var(--font-playfair)]">Testimonies</h2>
              </div>
              <Link href="/testimonies" className="inline-flex items-center gap-1 text-primary dark:text-primary-light hover:underline font-semibold text-sm">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonies.map((t) => (
                <Card key={t._id} hover className="p-6">
                  <Sparkles className="text-amber-400 mb-3" size={20} />
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">{t.body}</p>
                  <p className="text-xs text-slate-400 mt-3">— {t.authorName}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Panels */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in-up stagger-5">
            {[
              { href: '/prayers', icon: HandHeart, label: 'Prayer Wall', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
              { href: '/testimonies', icon: Star, label: 'Share Testimony', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
              { href: '/devotionals', icon: BookOpen, label: 'Devotionals', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
              { href: '/giving', icon: Heart, label: 'Give Online', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className={`${item.color} rounded-xl p-6 text-center hover:scale-[1.02] transition-transform`}>
                <item.icon className="mx-auto mb-2" size={28} />
                <span className="font-semibold text-sm">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Stream Banner */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wifi className="text-red-400 animate-pulse" size={20} />
            <span className="text-white/80 text-sm font-medium uppercase tracking-wider">Live Broadcast</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">Watch Our Services Live</h2>
          <p className="text-blue-100 mb-8 text-lg">Can&apos;t make it to church? Join us online for our live broadcasts every Sunday.</p>
          <Link href="/sermons" className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            <Play size={18} /> Watch Now
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4 font-[family-name:var(--font-playfair)]">Join Us This Sunday</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
            Experience the joy of worship, the power of prayer, and the warmth of community. We&apos;d love to welcome you!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/about" className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Plan Your Visit <ArrowRight size={18} />
            </Link>
            <Link href="/giving" className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white dark:border-primary-light dark:text-primary-light px-8 py-3 rounded-lg font-semibold transition-colors">
              Support Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
