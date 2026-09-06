// Curated talent profiles — all images feature Black creatives
// Images sourced from Unsplash (royalty-free)

const img = (id) => `https://images.unsplash.com/photo-${id}?w=500&h=500&fit=crop`;

export const talentProfiles = [
  {
    id: 1,
    name: 'Tara Mowery',
    location: 'Boston, MA',
    images: [img('1521119989659-a83eee488004'), img('1531123897727-8f129e168855')],
    badges: ['star'],
    hasReel: false,
  },
  {
    id: 2,
    name: 'Beatrice Fernando',
    location: 'Boston, MA',
    images: [img('1573496359142-b8d87734a5a2'), img('1607746882042-944635dfe10e')],
    badges: ['star', 'flame', 'chat'],
    hasReel: true,
  },
  {
    id: 3,
    name: 'Phil Gwilliam',
    location: 'Manchester, England, United Kingdom',
    images: [img('1542206395-9feb3edf68d8'), img('1521310266103-5e1eb3d31e44')],
    badges: ['star', 'chat'],
    hasReel: false,
  },
  {
    id: 4,
    name: 'Molly Lang',
    location: 'New York City, NY',
    images: [img('1531123897727-8f129e168855'), img('1521119989659-a83eee488004')],
    badges: ['star'],
    hasReel: false,
  },
  {
    id: 5,
    name: 'Danny Irizarry',
    location: 'Glendale, CA',
    images: [img('1556157382-97eda2d62296'), img('1599566150163-29194dcaad36')],
    badges: ['star'],
    hasReel: false,
  },
  {
    id: 6,
    name: 'Theresa Wilson',
    location: 'Tallahassee, FL',
    images: [img('1607746882042-944635dfe10e'), img('1573496359142-b8d87734a5a2')],
    badges: ['star', 'chat'],
    hasReel: true,
    overlayText: 'BOLD & BEYOND',
  },
  {
    id: 7,
    name: 'Richard Millen',
    location: 'Brooklyn, NY',
    images: [img('1521310266103-5e1eb3d31e44'), img('1542206395-9feb3edf68d8')],
    badges: ['star'],
    hasReel: false,
  },
  {
    id: 8,
    name: 'Amanda Ribnick',
    location: 'New York, NY',
    images: [img('1573496359142-b8d87734a5a2'), img('1607746882042-944635dfe10e')],
    badges: ['star', 'flame'],
    hasReel: false,
  },
  {
    id: 9,
    name: 'Marcus Johnson',
    location: 'Atlanta, GA',
    images: [img('1599566150163-29194dcaad36'), img('1556157382-97eda2d62296')],
    badges: ['star', 'flame', 'chat'],
    hasReel: true,
  },
  {
    id: 10,
    name: 'Niya Carter',
    location: 'Los Angeles, CA',
    images: [img('1521119989659-a83eee488004'), img('1531123897727-8f129e168855')],
    badges: ['star', 'chat'],
    hasReel: false,
  },
  {
    id: 11,
    name: 'Devon Hayes',
    location: 'Chicago, IL',
    images: [img('1542206395-9feb3edf68d8'), img('1521310266103-5e1eb3d31e44')],
    badges: ['star'],
    hasReel: false,
  },
  {
    id: 12,
    name: 'Jasmine Reed',
    location: 'Houston, TX',
    images: [img('1607746882042-944635dfe10e'), img('1573496359142-b8d87734a5a2')],
    badges: ['star', 'flame'],
    hasReel: true,
  },
];

export const talentTabs = [
  { id: 'actors', label: 'Actors & Performers', icon: '🎭' },
  { id: 'ugc', label: 'UGC Creators', icon: '📱' },
  { id: 'voiceover', label: 'Voiceover Artists', icon: '🎙️' },
  { id: 'crew', label: 'Crew', icon: '🎬' },
];

export const filterTags = [
  'Female Actors',
  'LA Actors',
  'London Actors',
  'Male Actors',
  'NYC Actors',
  'Theatre',
  'Union Actors',
];
