// Curated talent profiles — all images feature Black/African creatives
// Images sourced from Unsplash (royalty-free)

const img = (id) => `https://images.unsplash.com/photo-${id}?w=500&h=500&fit=crop`

export const talentProfiles = [
  {
    id: 1,
    name: 'Tara Mowery',
    location: 'Boston, MA',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1521119989659-a83eee488004'), img('1531123897727-8f129e168855')],
    badges: ['star'],
    hasReel: false,
    appearance: {
      height: '5\'6"',
      weight: '130 lbs',
      ageRange: '25-35',
      ethnicity: 'African American',
      build: 'Athletic',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Improvisation', 'Voiceover'],
    credits: {
      film: ['Independent Film A', 'Short Film B'],
      commercials: ['Brand Commercial X', 'TV Ad Y']
    },
    education: ['BFA in Acting - NYU'],
    socialMedia: {
      instagram: '@taramowery',
      linkedin: 'linkedin.com/in/taramowery'
    },
    representation: {
      agent: 'John Smith Agency',
      email: 'tara@smithagency.com'
    },
    unionMembership: ['SAG-AFTRA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 2,
    name: 'Theresa Wilson',
    location: 'Tallahassee, FL',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1607746882042-944635dfe10e'), img('1573496359142-b8d87734a5a2')],
    badges: ['star', 'chat'],
    hasReel: true,
    overlayText: 'BOLD & BEYOND',
    appearance: {
      height: '5\'5"',
      weight: '125 lbs',
      ageRange: '30-40',
      ethnicity: 'African American',
      build: 'Slim',
      hairColor: 'Dark Brown',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Voiceover', 'Writing'],
    credits: {
      film: ['Drama Q', 'Comedy R'],
      commercials: ['National Ad S']
    },
    education: ['MFA in Acting - FSU'],
    socialMedia: {
      instagram: '@theresawilson',
      linkedin: 'linkedin.com/in/theresawilson'
    },
    representation: {
      agent: 'Wilson Represents',
      email: 'theresa@wilsonrep.com'
    },
    unionMembership: ['SAG-AFTRA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 3,
    name: 'Marcus Johnson',
    location: 'Atlanta, GA',
    profession: 'Actor',
    gender: 'Male',
    images: [img('1599566150163-29194dcaad36'), img('1556157382-97eda2d62296')],
    badges: ['star', 'flame', 'chat'],
    hasReel: true,
    appearance: {
      height: '6\'0"',
      weight: '170 lbs',
      ageRange: '25-35',
      ethnicity: 'African American',
      build: 'Athletic',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Modeling', 'Voiceover'],
    credits: {
      film: ['Action AA', 'Drama BB'],
      commercials: ['Brand CC', 'Product DD']
    },
    education: ['BFA in Acting - Howard'],
    socialMedia: {
      instagram: '@marcusjohnson',
      twitter: '@marcusj'
    },
    representation: {
      agent: 'Johnson Talent',
      email: 'marcus@johnsontalent.com'
    },
    unionMembership: ['SAG-AFTRA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 4,
    name: 'Niya Carter',
    location: 'Los Angeles, CA',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1521119989659-a83eee488004'), img('1531123897727-8f129e168855')],
    badges: ['star', 'chat'],
    hasReel: false,
    appearance: {
      height: '5\'5"',
      weight: '120 lbs',
      ageRange: '20-30',
      ethnicity: 'African American',
      build: 'Slim',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Dance', 'Modeling'],
    credits: {
      film: ['Drama EE', 'Thriller FF'],
      commercials: ['Fashion GG']
    },
    education: ['AA in Theater - LA City College'],
    socialMedia: {
      instagram: '@niyacarter',
      tiktok: '@niya.actor'
    },
    representation: {
      agent: 'Carter Represents',
      email: 'niya@carterrep.com'
    },
    unionMembership: ['SAG-AFTRA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 5,
    name: 'Danny Irizarry',
    location: 'Glendale, CA',
    profession: 'Actor',
    gender: 'Male',
    images: [img('1556157382-97eda2d62296'), img('1599566150163-29194dcaad36')],
    badges: ['star'],
    hasReel: false,
    appearance: {
      height: '5\'10"',
      weight: '165 lbs',
      ageRange: '25-35',
      ethnicity: 'African American',
      build: 'Athletic',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Stunts', 'Martial Arts'],
    credits: {
      film: ['Action Film N', 'Thriller O'],
      commercials: ['Sports Commercial P']
    },
    education: ['AA in Film - LA City College'],
    socialMedia: {
      instagram: '@dannyirizarry',
      tiktok: '@danny.actor'
    },
    representation: {
      agent: 'Irizarry Talent',
      email: 'danny@irizarrytalent.com'
    },
    unionMembership: ['SAG-AFTRA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 6,
    name: 'Jasmine Reed',
    location: 'Houston, TX',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1607746882042-944635dfe10e'), img('1573496359142-b8d87734a5a2')],
    badges: ['star', 'flame'],
    hasReel: true,
    appearance: {
      height: '5\'6"',
      weight: '130 lbs',
      ageRange: '25-35',
      ethnicity: 'African American',
      build: 'Curvy',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Singing', 'Dance'],
    credits: {
      film: ['Musical KK', 'Drama LL'],
      commercials: ['Brand MM']
    },
    education: ['BFA in Musical Theater - UT Austin'],
    socialMedia: {
      instagram: '@jasminereed',
      youtube: 'Jasmine Reed Official'
    },
    representation: {
      agent: 'Reed Talent TX',
      email: 'jasmine@reedtalenttx.com'
    },
    unionMembership: ['SAG-AFTRA', 'AGMA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  // Additional profiles for the Featured Creators two-row carousel
  {
    id: 7,
    name: 'Esther Mukuhi Nungari',
    location: 'Nairobi, Nairobi Area, Kenya',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1534528741775-53994e69ac11'), img('1534528741775-53994e69ac11')],
    badges: ['star', 'flame'],
    hasReel: true,
    appearance: {
      height: '5\'7"',
      weight: '140 lbs',
      ageRange: '25-35',
      ethnicity: 'African',
      build: 'Athletic',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Modeling', 'Voiceover'],
    credits: {
      film: ['Kenyan Film A', 'Series B'],
      commercials: ['Brand C']
    },
    education: ['BA in Theater - University of Nairobi'],
    socialMedia: {
      instagram: '@esthermukuhi',
      tiktok: '@esther.actor'
    },
    representation: {
      agent: 'Nairobi Talent Agency',
      email: 'esther@nairobitalent.com'
    },
    unionMembership: ['KPA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 8,
    name: 'Jannell Tamara',
    location: 'Nairobi, Nairobi Area, Kenya',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1488426862021-9b2604411c8d'), img('1488426862021-9b2604411c8d')],
    badges: ['star', 'chat'],
    hasReel: false,
    appearance: {
      height: '5\'5"',
      weight: '125 lbs',
      ageRange: '20-30',
      ethnicity: 'African',
      build: 'Slim',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Dance', 'Modeling'],
    credits: {
      film: ['Short Film D', 'Documentary E']
    },
    education: ['Diploma in Acting - Kenya Film School'],
    socialMedia: {
      instagram: '@jannelltamara',
      twitter: '@jannellt'
    },
    representation: {
      agent: 'Tamara Talent',
      email: 'jannell@tamaratalent.com'
    },
    unionMembership: ['KPA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 9,
    name: 'Jaydon Mshindi',
    location: 'Nairobi, Nairobi Area, Kenya',
    profession: 'Actor',
    gender: 'Male',
    images: [img('1500648767791-00dcc994a43e'), img('1500648767791-00dcc994a43e')],
    badges: ['star'],
    hasReel: true,
    appearance: {
      height: '6\'0"',
      weight: '165 lbs',
      ageRange: '25-35',
      ethnicity: 'African',
      build: 'Athletic',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Voiceover', 'Directing'],
    credits: {
      film: ['Action F', 'Drama G'],
      commercials: ['Brand H']
    },
    education: ['BA in Film - Kenyatta University'],
    socialMedia: {
      instagram: '@jaydonmshindi',
      youtube: 'Jaydon Mshindi Official'
    },
    representation: {
      agent: 'Mshindi Productions',
      email: 'jaydon@mshindiproductions.com'
    },
    unionMembership: ['KPA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 10,
    name: 'Azwack',
    location: 'Nairobi, Nairobi Area, Kenya',
    profession: 'Actor',
    gender: 'Male',
    images: [img('1507003211169-0a1dd7228f2d'), img('1507003211169-0a1dd7228f2d')],
    badges: ['star', 'flame', 'chat'],
    hasReel: false,
    appearance: {
      height: '5\'11"',
      weight: '160 lbs',
      ageRange: '20-30',
      ethnicity: 'African',
      build: 'Athletic',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Modeling', 'Stunts'],
    credits: {
      film: ['Thriller I', 'Action J']
    },
    education: ['Certificate in Acting - Kenya Film School'],
    socialMedia: {
      instagram: '@azwack.official',
      tiktok: '@azwack'
    },
    representation: {
      agent: 'Azwack Management',
      email: 'azwack@azwackmgmt.com'
    },
    unionMembership: ['KPA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 11,
    name: 'Benard Mabiala',
    location: 'Nairobi, Nairobi Area, Kenya',
    profession: 'Actor',
    gender: 'Male',
    images: [img('1506794778202-cad84cf45ab1'), img('1506794778202-cad84cf45ab1')],
    badges: ['star'],
    hasReel: true,
    appearance: {
      height: '6\'1"',
      weight: '170 lbs',
      ageRange: '30-40',
      ethnicity: 'African',
      build: 'Average',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Voiceover', 'Writing'],
    credits: {
      film: ['Drama K', 'Comedy L']
    },
    education: ['MA in Theater - University of Nairobi'],
    socialMedia: {
      instagram: '@benardmabiala',
      linkedin: 'linkedin.com/in/benardmabiala'
    },
    representation: {
      agent: 'Mabiala Arts',
      email: 'benard@mabialaarts.com'
    },
    unionMembership: ['KPA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
  {
    id: 12,
    name: 'Nasieku',
    location: 'Nairobi, Nairobi Area, Kenya',
    profession: 'Actor',
    gender: 'Female',
    images: [img('1494790108374-be9c41f4f4be'), img('1494790108374-be9c41f4f4be')],
    badges: ['star', 'chat'],
    hasReel: false,
    appearance: {
      height: '5\'4"',
      weight: '120 lbs',
      ageRange: '20-30',
      ethnicity: 'African',
      build: 'Slim',
      hairColor: 'Black',
      eyeColor: 'Brown'
    },
    skills: ['Acting', 'Dance', 'Modeling'],
    credits: {
      film: ['Short Film M', 'Series N']
    },
    education: ['Diploma in Performing Arts - Kenya Film School'],
    socialMedia: {
      instagram: '@nasieku.official',
      tiktok: '@nasieku'
    },
    representation: {
      agent: 'Nasieku Talent',
      email: 'nasieku@nasiekutalent.com'
    },
    unionMembership: ['KPA'],
    licensePassport: {
      driverLicense: true,
      passport: true
    }
  },
]

export const talentTabs = [
  { id: 'actors', label: 'Actors & Performers', icon: '🎭' },
  { id: 'ugc', label: 'UGC Creators', icon: '📱' },
  { id: 'voiceover', label: 'Voiceover Artists', icon: '🎙️' },
  { id: 'crew', label: 'Crew', icon: '🎬' },
]

export const filterTags = [
  'Female Actors',
  'LA Actors',
  'London Actors',
  'Male Actors',
  'NYC Actors',
  'Theatre',
  'Union Actors',
]
