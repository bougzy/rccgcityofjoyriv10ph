export const SERVICE_TYPES = [
  { value: 'sunday-service', label: 'Sunday Main Service' },
  { value: 'sunday-school', label: 'Sunday School' },
  { value: 'workers-meeting', label: 'Workers Meeting' },
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'digging-deep', label: 'Digging Deep' },
  { value: 'faith-clinic', label: 'Faith Clinic' },
  { value: 'divine-visitation', label: 'Divine Visitation' },
  { value: 'special-program', label: 'Special Program' },
  { value: 'other', label: 'Other' },
] as const;

export const SERMON_CATEGORIES = [
  { value: 'sunday-service', label: 'Sunday Service' },
  { value: 'bible-study', label: 'Bible Study' },
  { value: 'special-program', label: 'Special Program' },
  { value: 'yaya', label: 'YAYA' },
  { value: 'conference', label: 'Conference' },
  { value: 'other', label: 'Other' },
] as const;

export const MEDIA_DESTINATIONS = [
  { value: 'sermons', label: 'Sermons Page' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'events', label: 'Events Page' },
  { value: 'yaya', label: 'YAYA Page' },
  { value: 'about', label: 'About Page' },
] as const;
