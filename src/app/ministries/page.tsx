'use client';

import Link from 'next/link';
import Navbar from '@/components/public/Navbar';
import Footer from '@/components/public/Footer';
import BackToTop from '@/components/public/BackToTop';
import Card from '@/components/ui/Card';
import {
  Music, Users, Heart, BookOpen, Globe, Flower2,
  Shield, HandHeart, ArrowRight
} from 'lucide-react';

const ministries = [
  {
    icon: Music,
    title: 'Worship & Praise',
    desc: 'Leading the congregation in heartfelt worship through anointed music and praise. Our worship team is dedicated to creating an atmosphere where God\'s presence is tangible and lives are transformed.',
    link: '/ministries',
  },
  {
    icon: Users,
    title: 'YAYA (Youth & Young Adults)',
    desc: 'Empowering the next generation to live purposeful and impactful lives for Christ. Through dynamic programs, mentorship, and fellowship, we are raising leaders who will shape the future.',
    link: '/yaya',
  },
  {
    icon: Heart,
    title: 'Children Ministry',
    desc: 'Nurturing young hearts for Christ through age-appropriate teaching, fun activities, and a loving environment. We believe in laying strong spiritual foundations from the earliest age.',
    link: '/ministries',
  },
  {
    icon: BookOpen,
    title: 'Prayer Warriors',
    desc: 'Interceding for the church, our community, and the nations through fervent and strategic prayer. Our prayer warriors stand in the gap, covering every aspect of the church\'s mission.',
    link: '/ministries',
  },
  {
    icon: Globe,
    title: 'Evangelism & Missions',
    desc: 'Reaching the lost for Christ through community outreach, evangelism campaigns, and mission trips. We are committed to fulfilling the Great Commission locally and globally.',
    link: '/ministries',
  },
  {
    icon: Flower2,
    title: 'Good Women Fellowship',
    desc: 'Empowering women in faith, family, and service. Our women\'s fellowship provides a supportive community for spiritual growth, leadership development, and mutual encouragement.',
    link: '/ministries',
  },
  {
    icon: Shield,
    title: 'Men\'s Fellowship',
    desc: 'Building godly men for leadership in the home, church, and society. Through Bible study, accountability, and fellowship, we equip men to fulfill their God-given roles.',
    link: '/ministries',
  },
  {
    icon: HandHeart,
    title: 'Welfare & Hospitality',
    desc: 'Caring for members and visitors with the love of Christ. Our welfare team ensures that no one is overlooked, providing practical support, warm hospitality, and a sense of belonging.',
    link: '/ministries',
  },
];

export default function MinistriesPage() {
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
            Serve & Grow
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-[family-name:var(--font-playfair)]">
            Our Ministries
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Discover the various departments and ministries through which we serve God and our community. There&apos;s a place for everyone to belong and serve.
          </p>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-badge">Departments</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 font-[family-name:var(--font-playfair)]">
              Ministry Departments
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Each ministry plays a vital role in the life of our church. Explore and find where God is calling you to serve.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ministries.map((ministry) => (
              <Card key={ministry.title} hover className="p-6 flex flex-col">
                <div className="w-14 h-14 bg-primary/10 dark:bg-primary-light/10 rounded-2xl flex items-center justify-center mb-4">
                  <ministry.icon className="text-primary dark:text-primary-light" size={26} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{ministry.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed flex-1">{ministry.desc}</p>
                <Link
                  href={ministry.link}
                  className="inline-flex items-center gap-1 text-primary dark:text-primary-light text-sm font-semibold mt-4 hover:underline"
                >
                  Learn More <ArrowRight size={14} />
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-badge">Join Us</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-4 mb-4 font-[family-name:var(--font-playfair)]">
            Get Involved Today
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            God has given every believer a gift and a purpose. We would love to help you discover yours and connect you to a ministry where you can thrive, grow, and make a lasting impact for the Kingdom of God.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us <ArrowRight size={18} />
            </Link>
            <Link
              href="/yaya"
              className="inline-flex items-center gap-2 border-2 border-yaya text-yaya hover:bg-yaya hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore YAYA <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Banner */}
      <section className="py-16 hero-gradient">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-[family-name:var(--font-playfair)]">
            Together We Can Do More
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            When we serve together, we reflect the love of Christ and make an impact that lasts for eternity.
          </p>
          <Link
            href="/giving"
            className="inline-flex items-center gap-2 bg-accent hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Support Our Ministries <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
      <BackToTop />
    </>
  );
}
