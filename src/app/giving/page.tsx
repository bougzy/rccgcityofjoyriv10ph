'use client';

import { useState } from 'react';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  Heart, Gift, Sparkles, Building2, Globe, Users,
  HandHeart, Star, Landmark, Copy, Check, ArrowRight,
  BookOpen, TrendingUp
} from 'lucide-react';

const whyWeGive = [
  {
    icon: BookOpen,
    title: 'Tithes',
    desc: 'Honouring God with the first fruits of our increase. The tithe is the Lord\'s and it is holy unto Him. Through faithful tithing, we acknowledge God as our source and open the windows of heaven over our lives.',
  },
  {
    icon: Heart,
    title: 'Offerings',
    desc: 'A freewill expression of gratitude and love to God. Our offerings go beyond the tithe as a generous response to God\'s goodness, supporting the work of ministry and the spread of the Gospel.',
  },
  {
    icon: Sparkles,
    title: 'Special Seeds',
    desc: 'Sowing into specific purposes and visions as led by the Holy Spirit. Special seeds are targeted giving towards building projects, missions, and other kingdom initiatives that advance God\'s work.',
  },
];

const givingCategories = [
  { icon: BookOpen, title: 'Tithes & Offerings', desc: 'Regular giving to support church operations and ministry.' },
  { icon: Building2, title: 'Building Fund', desc: 'Contributing towards church building and infrastructure projects.' },
  { icon: Globe, title: 'Missions & Outreach', desc: 'Supporting missionary work and community evangelism.' },
  { icon: HandHeart, title: 'Welfare', desc: 'Caring for the less privileged and supporting members in need.' },
  { icon: Users, title: 'Youth Ministry', desc: 'Investing in the next generation through YAYA programs.' },
  { icon: Star, title: 'Special Projects', desc: 'Contributing to specific church projects and initiatives.' },
];

const bankAccounts = [
  {
    bank: 'First Bank of Nigeria',
    accountName: 'RCCG City of Joy Parish',
    accountNumber: '3088XXXXXX',
    color: 'bg-blue-600',
  },
  {
    bank: 'GTBank',
    accountName: 'RCCG City of Joy Parish',
    accountNumber: '0XXXXXXXXX',
    color: 'bg-orange-600',
  },
];

const impactStats = [
  { value: '500+', label: 'Members Blessed', icon: Users },
  { value: '10+', label: 'Missionaries Supported', icon: Globe },
  { value: '25+', label: 'Community Projects', icon: TrendingUp },
];

export default function GivingPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback - just show copied briefly
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

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
            Give Generously
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Partner With Us
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Your generous giving supports the work of God at RCCG City of Joy and enables us to reach more lives with the Gospel of Jesus Christ.
          </p>
        </div>
      </section>

      {/* Why We Give */}
      <section className="py-20 bg-white dark:bg-slate-950 page-enter">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-1">
            <span className="section-badge">Why We Give</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Giving Is an Act of Worship
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              &ldquo;Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo; &mdash; 2 Corinthians 9:7
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up stagger-2">
            {whyWeGive.map((item) => (
              <Card key={item.title} hover className="p-8 text-center">
                <div className="w-16 h-16 bg-primary/10 dark:bg-primary-light/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <item.icon className="text-primary dark:text-primary-light" size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-[family-name:var(--font-playfair)]">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Giving Categories */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900 mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-3">
            <span className="section-badge">Categories</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Where Your Giving Goes
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Every naira you give is used faithfully to advance the kingdom of God and bless lives.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-4">
            {givingCategories.map((cat) => (
              <Card key={cat.title} hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center shrink-0">
                    <cat.icon className="text-accent" size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">{cat.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{cat.desc}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bank Account Details */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-5">
            <span className="section-badge">Bank Details</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Account Information
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              You can give via bank transfer to any of the accounts below. Click the button to copy the account number.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fade-in-up stagger-6">
            {bankAccounts.map((account, index) => (
              <Card key={account.bank} hover className="p-0 overflow-hidden">
                <div className={`${account.color} p-6 text-center`}>
                  <Landmark className="text-white mx-auto mb-2" size={32} />
                  <h3 className="text-xl font-bold text-white">{account.bank}</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Account Name</p>
                      <p className="font-bold text-slate-900 dark:text-white">{account.accountName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                      <p className="text-2xl font-bold text-primary dark:text-primary-light tracking-wider">{account.accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(account.accountNumber, index)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        copiedIndex === index
                          ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                          : 'bg-primary/10 dark:bg-primary-light/10 text-primary dark:text-primary-light hover:bg-primary/20 dark:hover:bg-primary-light/20'
                      }`}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check size={16} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} /> Copy Account Number
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-7">
            <span className="section-badge">Our Impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Your Giving Makes a Difference
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Through your generosity, we have been able to impact lives and communities for the glory of God.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up stagger-8">
            {impactStats.map((stat) => (
              <Card key={stat.label} hover className="p-8 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="text-accent" size={28} />
                </div>
                <p className="text-4xl font-bold text-primary dark:text-primary-light mb-2">{stat.value}</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">{stat.label}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Thank You for Your Generosity
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Every gift, no matter the size, makes a difference in advancing the kingdom of God. God bless you as you give!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              <Gift size={18} /> Give Now
            </a>
            <a
              href="/about"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-8 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
              Contact Us <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
