'use client';

import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  Heart, Star, Award, Users, HandHeart, Shield,
  MapPin, Phone, Mail, Clock, ArrowRight, BookOpen, Eye, Target
} from 'lucide-react';

const coreValues = [
  { icon: BookOpen, title: 'Faith', desc: 'Standing firm on the Word of God as our foundation for all we do.' },
  { icon: Heart, title: 'Love', desc: 'Demonstrating the unconditional love of Christ in every interaction.' },
  { icon: Award, title: 'Excellence', desc: 'Giving our best in service to God and His people at all times.' },
  { icon: Users, title: 'Unity', desc: 'Walking together in harmony as one body in Christ Jesus.' },
  { icon: HandHeart, title: 'Service', desc: 'Serving God and humanity with humility, passion, and dedication.' },
  { icon: Shield, title: 'Integrity', desc: 'Living transparent, honest, and accountable lives before God and man.' },
];

export default function AboutPage() {
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
            Get To Know Us
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            About Us
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Discover the story, vision, and heart behind RCCG City of Joy Parish &mdash; Rivers Province 10 Headquarters.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white dark:bg-slate-950 page-enter mesh-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-fade-in-up stagger-1">
            <div>
              <span className="section-badge">Our Story</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
                A Beacon of Faith &amp; Transformation
              </h2>
              <p className="mt-6 text-slate-600 dark:text-slate-400 leading-relaxed">
                Founded as the Rivers Province 10 Headquarters of The Redeemed Christian Church of God, RCCG City of Joy Parish has been a beacon of faith, hope, and transformation in Port Harcourt and beyond.
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                From humble beginnings, the church has grown into a vibrant community of believers committed to the Great Commission. Under anointed leadership and the guidance of the Holy Spirit, we have witnessed countless lives transformed, families restored, and destinies fulfilled.
              </p>
              <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                As a Provincial Headquarters, we oversee and support multiple parishes across Rivers Province 10, nurturing church growth and ensuring that the gospel reaches every corner of our province and beyond.
              </p>
            </div>
            <div className="relative">
              <div className="bg-primary/5 dark:bg-primary-light/5 rounded-2xl p-8">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: '10+', label: 'Years of Ministry' },
                    { value: '500+', label: 'Church Members' },
                    { value: '20+', label: 'Parishes Overseen' },
                    { value: '100+', label: 'Workers & Volunteers' },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-3xl font-bold text-primary dark:text-primary-light">{stat.value}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-2">
            <span className="section-badge">Our Direction</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Vision &amp; Mission
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up stagger-3">
            <Card hover className="p-8">
              <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/10 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="text-primary dark:text-primary-light" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-[family-name:var(--font-playfair)]">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To make heaven, to take as many people with us, to have a member of RCCG in every family of all nations, and to accomplish this by planting churches within five minutes walking distance in every city and town of developing countries, and within five minutes driving distance in every city and town of developed countries.
              </p>
            </Card>
            <Card hover className="p-8">
              <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                <Target className="text-accent" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 font-[family-name:var(--font-playfair)]">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                To accomplish the above, holiness will be our lifestyle. We will plant churches and raise role models who will serve as pillars in the society. We will build a network of churches where the spirit of God is at work, believers are equipped for ministry, and lives are transformed by the power of the Gospel.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-4">
            <span className="section-badge">What We Stand For</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Our Core Values
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              These principles guide everything we do as a church and as individuals.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-5">
            {coreValues.map((value) => (
              <Card key={value.title} hover className="p-6 text-center">
                <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-primary dark:text-primary-light" size={26} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{value.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-6">
            <span className="section-badge">Leadership</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Meet Our Pastors
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Dedicated servants of God leading our church with wisdom, grace, and the anointing of the Holy Spirit.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto animate-fade-in-up stagger-7">
            {[
              {
                name: 'Pastor Solomon Marega',
                role: 'Pastor in Charge, Rivers Province 10',
                bio: 'Pastor Solomon Marega is a devoted servant of God who leads RCCG City of Joy Parish and oversees Rivers Province 10. His passion for souls and commitment to the Word of God have been instrumental in the growth and transformation of lives across the province.',
              },
              {
                name: 'Assistant Pastor',
                role: 'Assistant Pastor in Charge',
                bio: 'Working alongside the Pastor in Charge, our Assistant Pastor brings dedication, compassion, and a heart for discipleship to the ministry. Together, they lead the church in fulfilling its God-given mandate.',
              },
            ].map((pastor) => (
              <Card key={pastor.name} hover className="p-8 text-center">
                <div className="w-24 h-24 bg-primary/10 dark:bg-primary-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="text-primary dark:text-primary-light" size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 font-[family-name:var(--font-playfair)]">
                  {pastor.name}
                </h3>
                <p className="text-accent font-semibold text-sm mb-4">{pastor.role}</p>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{pastor.bio}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up stagger-8">
            <span className="section-badge">Reach Us</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Contact &amp; Location
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              We would love to hear from you and welcome you to our church.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up stagger-8">
            {[
              { icon: MapPin, title: 'Address', info: 'RCCG City of Joy Parish, Port Harcourt, Rivers State, Nigeria' },
              { icon: Phone, title: 'Phone', info: '+234 000 000 0000' },
              { icon: Mail, title: 'Email', info: 'info@rccgcoj.org' },
              { icon: Clock, title: 'Service Times', info: 'Sunday: 7:00 AM - 12:00 PM\nTue & Thu: 5:30 PM' },
            ].map((item) => (
              <Card key={item.title} hover className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 dark:bg-primary-light/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="text-primary dark:text-primary-light" size={22} />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">{item.info}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Join Us This Sunday
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Experience the joy of being part of a loving church family. We can&apos;t wait to meet you!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sermons"
              className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Watch Sermons <ArrowRight size={18} />
            </Link>
            <Link
              href="/giving"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-8 py-3 rounded-lg font-semibold backdrop-blur-sm transition-colors"
            >
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
