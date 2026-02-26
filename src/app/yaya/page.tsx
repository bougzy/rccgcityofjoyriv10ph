'use client';

import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  Users, Flame, BookOpen, Heart, Mountain, Calendar,
  Clock, MapPin, ArrowRight, Star, Target, Zap
} from 'lucide-react';

const stats = [
  { value: '150+', label: 'Active Members' },
  { value: '20+', label: 'Cell Groups' },
  { value: '50+', label: 'Volunteers' },
  { value: '12+', label: 'Events/Year' },
];

const programs = [
  {
    icon: Flame,
    title: 'Friday Night Alive',
    desc: 'A vibrant weekly gathering of worship, the Word, and fellowship designed to set young hearts ablaze for God. Experience powerful praise, relevant teaching, and real community every Friday evening.',
    time: 'Every Friday, 5:30 PM',
  },
  {
    icon: BookOpen,
    title: 'Bible Study',
    desc: 'In-depth exploration of God\'s Word tailored for young minds. Our Bible study sessions tackle real-life topics from a biblical perspective, building strong spiritual foundations for everyday living.',
    time: 'Bi-weekly, Saturdays',
  },
  {
    icon: Heart,
    title: 'Community Service',
    desc: 'Living out our faith through action by serving our community. From outreach programs to social impact projects, YAYA members are making a difference in Port Harcourt and beyond.',
    time: 'Monthly outreach',
  },
  {
    icon: Mountain,
    title: 'Annual Retreat',
    desc: 'A refreshing getaway for spiritual renewal, deep bonding, and encounters with God. Our annual retreat is a highlight of the YAYA calendar, bringing together young people from across the province.',
    time: 'Once a year',
  },
];

const schedule = [
  { day: 'Friday', time: '5:30 PM', activity: 'YAYA Fellowship (Friday Night Alive)', icon: Flame },
  { day: 'Saturday (Monthly)', time: 'Various', activity: 'Community Outreach & Service', icon: Heart },
];

export default function YAYAPage() {
  return (
    <>
      <Navbar />

      {/* Hero Section - Purple Theme */}
      <section className="yaya-gradient relative min-h-[400px] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <span className="inline-block bg-white/15 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
            The Next Generation
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            YAYA - Youth &amp; Young Adults Affairs
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Raising a generation of young people who are rooted in Christ, passionate about purpose, and committed to transforming their world.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <a
              href="#programs"
              className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Our Programs <ArrowRight size={18} />
            </a>
            <Link
              href="/ministries"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-6 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
              All Ministries
            </Link>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="section-badge">Our Vision</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
                Raising a Generation for Christ
              </h2>
              <p className="mt-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                To raise a generation of young people who are rooted in Christ, grounded in the Word of God, and equipped to fulfil their God-given purpose. We believe that the youth are not just the church of tomorrow &mdash; they are the church of today.
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                Through relevant teaching, mentorship, fellowship, and outreach, YAYA provides a platform where young people can discover their identity in Christ, develop their gifts, and deploy them for the advancement of God&apos;s kingdom.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-yaya/10 rounded-xl flex items-center justify-center">
                  <Target className="text-yaya" size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Our Motto</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Rooted. Relevant. Ready.</p>
                </div>
              </div>
            </div>
            <div className="bg-yaya/5 dark:bg-yaya-light/5 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-3xl font-bold text-yaya dark:text-yaya-light">{stat.value}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section id="programs" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">What We Do</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Our Programs
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Engaging activities and programs designed to help young people grow spiritually, connect meaningfully, and serve purposefully.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {programs.map((program) => (
              <Card key={program.title} hover className="p-8">
                <div className="w-14 h-14 bg-yaya/10 dark:bg-yaya-light/10 rounded-2xl flex items-center justify-center mb-6">
                  <program.icon className="text-yaya dark:text-yaya-light" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-[family-name:var(--font-playfair)]">
                  {program.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{program.desc}</p>
                <div className="flex items-center gap-2 text-sm text-yaya dark:text-yaya-light font-semibold">
                  <Clock size={14} />
                  <span>{program.time}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* YAYA Leadership */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              YAYA Leadership
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Passionate leaders committed to raising a generation of world changers.
            </p>
          </div>
          <div className="max-w-md mx-auto">
            <Card hover className="p-8 text-center">
              <div className="w-24 h-24 bg-yaya/10 dark:bg-yaya-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="text-yaya dark:text-yaya-light" size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-[family-name:var(--font-playfair)]">
                YAYA Coordinator
              </h3>
              <p className="text-yaya dark:text-yaya-light font-semibold text-sm mb-4">Youth & Young Adults Coordinator</p>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Leading the YAYA department with passion and vision, our coordinator works tirelessly to create an environment where young people can encounter God, build genuine relationships, and discover their purpose.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Schedule</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              When We Meet
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Join us at our regular meetings and activities. Everyone is welcome!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {schedule.map((item) => (
              <Card key={item.activity} hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yaya/10 dark:bg-yaya-light/10 rounded-xl flex items-center justify-center shrink-0">
                    <item.icon className="text-yaya dark:text-yaya-light" size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-yaya bg-purple-50 dark:bg-purple-900/20 px-2 py-0.5 rounded-full">{item.day}</span>
                      <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                        <Clock size={12} /> {item.time}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{item.activity}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 yaya-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Zap className="text-accent mx-auto mb-4" size={32} />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Be Part of Something Greater
          </h2>
          <p className="text-purple-100 mb-8 text-lg">
            Whether you&apos;re looking for community, purpose, or a deeper relationship with God, YAYA is the place for you. Come as you are and grow with us!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Join YAYA <ArrowRight size={18} />
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-8 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
              <Calendar size={18} /> Upcoming Events
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
