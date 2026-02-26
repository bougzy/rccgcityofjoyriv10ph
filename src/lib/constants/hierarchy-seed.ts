export const PROVINCE_SEED = {
  name: 'Rivers Province 10',
  shortName: 'RP10',
  picName: 'Pastor Solomon Marega',
  picPhone: '',
  picEmail: '',
  address: 'Port Harcourt, Rivers State',
};

export const HIERARCHY_SEED = {
  zones: [
    {
      name: 'Zone 1',
      code: 'Z1',
      zonalPastorName: '',
      areas: [
        {
          name: 'Area 1',
          code: 'Z1-A1',
          areaPastorName: '',
          parishes: [
            { name: 'City of Joy Parish', code: 'COJ', pastorName: 'Pastor Solomon Marega', address: 'Port Harcourt', isHeadquarters: true },
            { name: 'Grace Assembly', code: 'GA', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Victory Chapel', code: 'VC', pastorName: '', address: '', isHeadquarters: false },
          ],
        },
        {
          name: 'Area 2',
          code: 'Z1-A2',
          areaPastorName: '',
          parishes: [
            { name: 'Peace House', code: 'PH', pastorName: '', address: '', isHeadquarters: false },
            { name: 'New Dawn Parish', code: 'NDP', pastorName: '', address: '', isHeadquarters: false },
          ],
        },
      ],
    },
    {
      name: 'Zone 2',
      code: 'Z2',
      zonalPastorName: '',
      areas: [
        {
          name: 'Area 1',
          code: 'Z2-A1',
          areaPastorName: '',
          parishes: [
            { name: 'Covenant Chapel', code: 'CC', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Restoration Assembly', code: 'RA', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Dominion City', code: 'DC', pastorName: '', address: '', isHeadquarters: false },
          ],
        },
        {
          name: 'Area 2',
          code: 'Z2-A2',
          areaPastorName: '',
          parishes: [
            { name: 'Glorious Chapel', code: 'GC', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Faith Tabernacle', code: 'FT', pastorName: '', address: '', isHeadquarters: false },
          ],
        },
      ],
    },
    {
      name: 'Zone 3',
      code: 'Z3',
      zonalPastorName: '',
      areas: [
        {
          name: 'Area 1',
          code: 'Z3-A1',
          areaPastorName: '',
          parishes: [
            { name: 'Light House Parish', code: 'LHP', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Mount Zion Parish', code: 'MZP', pastorName: '', address: '', isHeadquarters: false },
          ],
        },
        {
          name: 'Area 2',
          code: 'Z3-A2',
          areaPastorName: '',
          parishes: [
            { name: 'Bethel Chapel', code: 'BC', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Emmanuel Parish', code: 'EP', pastorName: '', address: '', isHeadquarters: false },
            { name: 'Kingdom Heritage', code: 'KH', pastorName: '', address: '', isHeadquarters: false },
          ],
        },
      ],
    },
  ],
};

export const ADMIN_SEED = {
  name: 'Admin',
  email: 'admin@rccgcoj.org',
  password: 'admin123',
  role: 'super-admin',
  scopeType: 'province',
};

// Sample users for testing different roles
export const SAMPLE_USERS = [
  {
    name: 'Zone 1 Pastor',
    email: 'zone1@rccgcoj.org',
    password: 'zone123',
    role: 'zone-admin',
    scopeType: 'zone',
  },
  {
    name: 'Area 1 Pastor',
    email: 'area1@rccgcoj.org',
    password: 'area123',
    role: 'area-admin',
    scopeType: 'area',
  },
  {
    name: 'Parish Admin',
    email: 'parish@rccgcoj.org',
    password: 'parish123',
    role: 'parish-admin',
    scopeType: 'parish',
  },
];

// Natural group types to seed per parish
export const NATURAL_GROUP_SEED = [
  { type: 'yaya', name: 'YAYA — Young Adults & Youth Assembly', slug: 'yaya', meetingDay: 'Friday', meetingTime: '5:30 PM' },
  { type: 'men-fellowship', name: 'Men Fellowship', slug: 'men-fellowship', meetingDay: 'Saturday', meetingTime: '8:00 AM' },
  { type: 'women-fellowship', name: 'Good Women Fellowship', slug: 'women-fellowship', meetingDay: 'Saturday', meetingTime: '9:00 AM' },
  { type: 'teens-church', name: 'Teens Church', slug: 'teens-church', meetingDay: 'Sunday', meetingTime: '9:00 AM' },
  { type: 'children-church', name: 'Children Church', slug: 'children-church', meetingDay: 'Sunday', meetingTime: '9:00 AM' },
  { type: 'singles-fellowship', name: 'Singles Fellowship', slug: 'singles-fellowship', meetingDay: 'Saturday', meetingTime: '4:00 PM' },
  { type: 'married-couples', name: 'Married Couples Fellowship', slug: 'married-couples', meetingDay: 'Saturday', meetingTime: '5:00 PM' },
  { type: 'senior-citizens', name: 'Senior Citizens Fellowship', slug: 'senior-citizens', meetingDay: 'Wednesday', meetingTime: '10:00 AM' },
  { type: 'choir', name: 'Choir Ministry', slug: 'choir', meetingDay: 'Saturday', meetingTime: '4:00 PM' },
  { type: 'ushers', name: 'Ushers Unit', slug: 'ushers', meetingDay: 'Saturday', meetingTime: '5:00 PM' },
  { type: 'protocol', name: 'Protocol Unit', slug: 'protocol', meetingDay: 'Saturday', meetingTime: '3:00 PM' },
  { type: 'sunday-school', name: 'Sunday School', slug: 'sunday-school', meetingDay: 'Sunday', meetingTime: '8:30 AM' },
  { type: 'workers-in-training', name: 'Workers-in-Training (WIT)', slug: 'workers-in-training', meetingDay: 'Saturday', meetingTime: '10:00 AM' },
  { type: 'evangelism', name: 'Evangelism Ministry', slug: 'evangelism', meetingDay: 'Saturday', meetingTime: '7:00 AM' },
  { type: 'media-technical', name: 'Media & Technical Ministry', slug: 'media-technical', meetingDay: 'Saturday', meetingTime: '3:00 PM' },
  { type: 'prayer-intercession', name: 'Prayer & Intercession Unit', slug: 'prayer-intercession', meetingDay: 'Wednesday', meetingTime: '6:00 PM' },
];
