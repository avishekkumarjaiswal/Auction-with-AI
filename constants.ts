
import { Player, PlayerStatus, Team, Sponsor, AuctionRules } from './types';

export const AUCTION_RULES: AuctionRules = {
  maxSquadSize: 25,
  minSquadSize: 18,
  maxOverseas: 8,
  initialPurse: 100.0,
  increments: [
    { upTo: 1.0, increment: 0.05 },
    { upTo: 2.0, increment: 0.10 },
    { upTo: 5.0, increment: 0.25 },
    { upTo: 10.0, increment: 0.50 },
    { upTo: 999.0, increment: 1.0 }
  ],
  rtmConfig: {
    maxTotal: 6,
    maxOverseas: 2,
    maxIndian: 6
  },
  timeConfig: {
    bidDuration: 30,
    rtmDuration: 20,
    breakDuration: 10
  }
};

export const INITIAL_TEAMS: Team[] = [
  {
    id: 't1',
    name: 'Chennai Super Kings',
    shortName: 'CSK',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png',
    color: 'bg-yellow-500',
    squad: [],
    password: 'csk',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't6',
    name: 'Delhi Capitals',
    shortName: 'DC',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://documents.iplt20.com/ipl/DC/Logos/LogoOutline/DCoutline.png',
    color: 'bg-blue-500',
    squad: [],
    password: 'dc',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't5',
    name: 'Gujarat Titans',
    shortName: 'GT',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png',
    color: 'bg-indigo-800',
    squad: [],
    password: 'gt',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't4',
    name: 'Kolkata Knight Riders',
    shortName: 'KKR',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png',
    color: 'bg-purple-700',
    squad: [],
    password: 'kkr',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't7',
    name: 'Lucknow Super Giants',
    shortName: 'LSG',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lucknow_Super_Giants_IPL_Logo.svg/1200px-Lucknow_Super_Giants_IPL_Logo.svg.png',
    color: 'bg-cyan-500',
    squad: [],
    password: 'lsg',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't2',
    name: 'Mumbai Indians',
    shortName: 'MI',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png',
    color: 'bg-blue-600',
    squad: [],
    password: 'mi',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't8',
    name: 'Punjab Kings',
    shortName: 'PBKS',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/1200px-Punjab_Kings_Logo.svg.png',
    color: 'bg-red-500',
    squad: [],
    password: 'pbks',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't9',
    name: 'Rajasthan Royals',
    shortName: 'RR',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://documents.iplt20.com/ipl/RR/Logos/Logooutline/RRoutline.png',
    color: 'bg-pink-600',
    squad: [],
    password: 'rr',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't3',
    name: 'Royal Challengers Bengaluru',
    shortName: 'RCB',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://documents.iplt20.com/ipl/RCB/Logos/Logooutline/RCBoutline.png',
    color: 'bg-red-600',
    squad: [],
    password: 'rcb',
    rtmUsed: { indian: 0, overseas: 0 }
  },
  {
    id: 't10',
    name: 'Sunrisers Hyderabad',
    shortName: 'SRH',
    budget: 100.0,
    initialBudget: 100.0,
    logo: 'https://documents.iplt20.com/ipl/SRH/Logos/Logooutline/SRHoutline.png',
    color: 'bg-orange-500',
    squad: [],
    password: 'srh',
    rtmUsed: { indian: 0, overseas: 0 }
  }
];

export const INITIAL_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Jasprit Bumrah',
    role: 'Bowler',
    nationality: 'India',
    rating: 95,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/340500/340583.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't2' // MI
  },
  {
    id: 'p2',
    name: 'Virat Kohli',
    role: 'Batsman',
    nationality: 'India',
    rating: 98,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/316600/316605.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't3' // RCB
  },
  {
    id: 'p3',
    name: 'Ben Stokes',
    role: 'All-Rounder',
    nationality: 'England',
    rating: 92,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/316600/316694.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't1' // CSK
  },
  {
    id: 'p4',
    name: 'Rashid Khan',
    role: 'Bowler',
    nationality: 'Afghanistan',
    rating: 94,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/321500/321597.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't5' // GT
  },
  {
    id: 'p5',
    name: 'Travis Head',
    role: 'Batsman',
    nationality: 'Australia',
    rating: 89,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/370700/370783.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't10' // SRH
  },
   {
    id: 'p6',
    name: 'Glenn Maxwell',
    role: 'All-Rounder',
    nationality: 'Australia',
    rating: 88,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/316600/316619.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't3' // RCB
  },
   {
    id: 'p7',
    name: 'Rohit Sharma',
    role: 'Batsman',
    nationality: 'India',
    rating: 94,
    basePrice: 2.0,
    image: 'https://img1.hscicdn.com/image/upload/f_auto,t_ds_w_960,q_50/lsci/db/PICTURES/CMS/316500/316584.jpg',
    status: PlayerStatus.Upcoming,
    previousTeamId: 't2' // MI
  }
];

export const INITIAL_SPONSORS: Sponsor[] = [
  { id: 's1', name: 'Tata Group', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tata_logo.svg/1200px-Tata_logo.svg.png', isVisible: true, type: 'Title' },
  { id: 's2', name: 'Jio', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jio_Logo.png/600px-Jio_Logo.png', isVisible: true, type: 'PoweredBy' },
  { id: 's3', name: 'Asian Paints', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Asian_Paints.svg/1200px-Asian_Paints.svg.png', isVisible: true, type: 'Associate' },
  { id: 's4', name: 'Bisleri', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Bisleri_logo.svg/1200px-Bisleri_logo.svg.png', isVisible: true, type: 'Associate' },
  { id: 's5', name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1200px-Adidas_Logo.svg.png', isVisible: true, type: 'Associate' },
];

export const SIDEBAR_SPONSORS_LIST = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Asian_Paints.svg/1200px-Asian_Paints.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Jio_Logo.png/600px-Jio_Logo.png',
    'https://upload.wikimedia.org/wikipedia/en/thumb/3/36/Bisleri_logo.svg/1200px-Bisleri_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/2560px-EBay_logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Adidas_Logo.svg/1200px-Adidas_Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Samsung_Logo.svg/2560px-Samsung_Logo.svg.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png',
];
