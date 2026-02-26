export type HierarchyLevel = 'province' | 'zone' | 'area' | 'parish';

export type UserRole = 'super-admin' | 'zone-admin' | 'area-admin' | 'parish-admin' | 'group-admin' | 'member';

export type ScopeType = 'province' | 'zone' | 'area' | 'parish' | 'group';

export type NaturalGroupType =
  | 'yaya'
  | 'men-fellowship'
  | 'women-fellowship'
  | 'teens-church'
  | 'children-church'
  | 'singles-fellowship'
  | 'married-couples'
  | 'senior-citizens'
  | 'choir'
  | 'ushers'
  | 'protocol'
  | 'sunday-school'
  | 'workers-in-training'
  | 'evangelism'
  | 'media-technical'
  | 'prayer-intercession';

export type ServiceType =
  | 'sunday-service'
  | 'sunday-school'
  | 'bible-study'
  | 'digging-deep'
  | 'faith-clinic'
  | 'special-program'
  | 'divine-visitation'
  | 'workers-meeting'
  | 'other';

export type MediaType = 'video' | 'audio' | 'image';

export type AnnouncementPriority = 'normal' | 'important' | 'urgent';

export type AnnouncementCategory = 'general' | 'event' | 'prayer' | 'administrative' | 'program';

export interface IProvince {
  _id: string;
  name: string;
  shortName: string;
  picName: string;
  picPhone: string;
  picEmail: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IZone {
  _id: string;
  province: string;
  name: string;
  code: string;
  zonalPastorName: string;
  zonalPastorPhone: string;
  zonalPastorEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IArea {
  _id: string;
  province: string;
  zone: string;
  name: string;
  code: string;
  areaPastorName: string;
  areaPastorPhone: string;
  areaPastorEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IParish {
  _id: string;
  province: string;
  zone: string;
  area: string;
  name: string;
  code: string;
  pastorName: string;
  pastorPhone: string;
  pastorEmail: string;
  address: string;
  isHeadquarters: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface INaturalGroupData {
  _id: string;
  parish: string;
  name: string;
  slug: string;
  type: NaturalGroupType;
  description: string;
  meetingDay: string;
  meetingTime: string;
  meetingVenue: string;
  leaderName: string;
  leaderPhone: string;
  leaderEmail: string;
  coverImage: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  scopeType: ScopeType;
  scopeId: string;
  parishId?: string;
  naturalGroupId?: string;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

export interface IRoleAssignment {
  _id: string;
  userId: string;
  role: string;
  scopeType: ScopeType;
  scopeId: string;
  assignedBy: string;
  createdAt: Date;
}

export interface ISermon {
  _id: string;
  title: string;
  preacher: string;
  category: string;
  description: string;
  bibleReference: string;
  date: string;
  mediaType: MediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  quality: string;
  duration: string;
  featured: boolean;
  destinations: string[];
  parish?: string;
  views: number;
  downloads: number;
  createdAt: Date;
}

export interface ILivestream {
  _id: string;
  isLive: boolean;
  platform: string;
  videoId: string;
  streamUrl: string;
  embedUrl: string;
  title: string;
  preacher: string;
  category: string;
  quality: string;
  description: string;
  autoSave: boolean;
  destinations: string[];
  startedAt: Date;
  updatedAt: Date;
}

export interface IAttendance {
  _id: string;
  province: string;
  zone?: string;
  area?: string;
  parish?: string;
  level: HierarchyLevel;
  entityId: string;
  entityName: string;
  date: Date;
  serviceType: ServiceType;
  serviceLabel: string;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  totalYouth: number;
  totalWorkers: number;
  grandTotal: number;
  firstTimers: number;
  salvations: number;
  notes: string;
  recordedBy: string;
  createdAt: Date;
}

export interface IAnnouncement {
  _id: string;
  province: string;
  zone?: string;
  area?: string;
  parish?: string;
  level: HierarchyLevel;
  entityId: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  visibleToChildren: boolean;
  isActive: boolean;
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMembershipSnapshot {
  _id: string;
  province: string;
  zone?: string;
  area?: string;
  parish?: string;
  level: HierarchyLevel;
  entityId: string;
  month: string;
  totalMembers: number;
  totalWorkers: number;
  newMembers: number;
  newConverts: number;
  createdAt: Date;
}

export interface HierarchySelection {
  level: HierarchyLevel;
  provinceId: string;
  provinceName: string;
  zoneId: string | null;
  zoneName: string | null;
  areaId: string | null;
  areaName: string | null;
  parishId: string | null;
  parishName: string | null;
}
