import {
  Home, Info, BookOpen, Calendar, Heart, Users, Zap,
  LayoutDashboard, Upload, Music, Radio, ClipboardList,
  Megaphone, BarChart3, Network, Settings, UserCog, UsersRound,
  CalendarDays, FileText, TrendingUp, UserPlus, DollarSign,
  HandHeart, Sparkles, BookMarked, HandHelping, Activity,
  ShoppingBag, Store,
} from 'lucide-react';
import type { UserRole } from '@/types';

export const publicNavLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  {
    label: 'Ministries',
    children: [
      { href: '/ministries', label: 'All Ministries' },
      { href: '/yaya', label: 'YAYA' },
      { href: '/events', label: 'Events' },
    ],
  },
  { href: '/sermons', label: 'Sermons' },
  {
    label: 'Community',
    children: [
      { href: '/prayers', label: 'Prayer Wall' },
      { href: '/testimonies', label: 'Testimonies' },
      { href: '/devotionals', label: 'Devotionals' },
    ],
  },
  { href: '/giving', label: 'Giving' },
  { href: '/marketplace', label: 'Marketplace' },
];

export interface AdminNavLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles?: UserRole[];
}

export const adminNavLinks: AdminNavLink[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/upload', label: 'Upload Media', icon: Upload },
  { href: '/admin/sermons', label: 'Sermons', icon: Music },
  { href: '/admin/livestream', label: 'Livestream', icon: Radio },
  { href: '/admin/attendance', label: 'Attendance', icon: ClipboardList },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/admin/natural-groups', label: 'Natural Groups', icon: UsersRound },
  { href: '/admin/events', label: 'Events', icon: CalendarDays },
  { href: '/admin/forms', label: 'Forms', icon: FileText },
  { href: '/admin/engagement', label: 'Engagement', icon: TrendingUp },
  { href: '/admin/converts', label: 'Converts', icon: UserPlus },
  { href: '/admin/growth', label: 'Growth', icon: BarChart3 },
  { href: '/admin/prayers', label: 'Prayers', icon: HandHeart },
  { href: '/admin/testimonies', label: 'Testimonies', icon: Sparkles },
  { href: '/admin/devotionals', label: 'Devotionals', icon: BookMarked },
  { href: '/admin/volunteers', label: 'Volunteers', icon: HandHelping },
  { href: '/admin/live-counter', label: 'Live Counter', icon: Activity },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/hierarchy', label: 'Hierarchy', icon: Network, roles: ['super-admin'] },
  { href: '/admin/users', label: 'Users', icon: UserCog, roles: ['super-admin'] },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['super-admin'] },
  { href: '/admin/my-store', label: 'My Store', icon: Store },
];