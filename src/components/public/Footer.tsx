import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Facebook, Youtube, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 animate-fade-in-up">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/img/Rccg_logo.png" alt="RCCG Logo" width={48} height={48} className="rounded-full" />
              <div>
                <h3 className="text-white font-bold text-lg">RCCG City Of Joy</h3>
                <p className="text-sm text-slate-400">Rivers Province 10 HQ</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              A place of joy, worship, and transformation. Join us as we experience the love of God together.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-primary transition-colors text-slate-400 hover:text-white">
                <Facebook size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-red-600 transition-colors text-slate-400 hover:text-white">
                <Youtube size={18} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-800 hover:bg-pink-600 transition-colors text-slate-400 hover:text-white">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/about', label: 'About Us' },
                { href: '/sermons', label: 'Sermons' },
                { href: '/events', label: 'Events' },
                { href: '/giving', label: 'Give Online' },
                { href: '/ministries', label: 'Ministries' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {[
                { href: '/yaya', label: 'YAYA Ministry' },
                { href: '/sermons', label: 'Sermon Library' },
                { href: '/events', label: 'Church Calendar' },
                { href: '/giving', label: 'Giving' },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-slate-400 hover:text-accent transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-slate-400">Port Harcourt, Rivers State, Nigeria</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent shrink-0" />
                <span className="text-sm text-slate-400">+234 000 000 0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent shrink-0" />
                <span className="text-sm text-slate-400">info@rccgcoj.org</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={16} className="text-accent mt-0.5 shrink-0" />
                <div className="text-sm text-slate-400">
                  <p>Sunday: 7:00 AM - 12:00 PM</p>
                  <p>Tuesday & Thursday: 5:30 PM</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} RCCG City Of Joy Parish. All rights reserved.
          </p>
          <p className="text-sm text-slate-500">Rivers Province 10 Headquarters</p>
        </div>
      </div>
    </footer>
  );
}
