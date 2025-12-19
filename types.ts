
export enum PlayerStatus {
  Unsold = 'UNSOLD',
  Sold = 'SOLD',
  Upcoming = 'UPCOMING',
  OnAuction = 'ON_AUCTION'
}

export interface Player {
  id: string;
  name: string;
  role: 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicketkeeper';
  nationality: string;
  rating: number;
  basePrice: number; // In Crores
  soldPrice?: number;
  teamId?: string;
  image: string;
  status: PlayerStatus;
  soldTimestamp?: number;
  previousTeamId?: string; // ID of the team holding RTM card
  soldViaRTM?: boolean;    // Flag if sold via RTM
}

export interface Team {
  id: string;
  name: string;
  shortName: string; // e.g., CSK
  budget: number; // Remaining purse
  initialBudget: number;
  logo: string;
  color: string;
  squad: Player[];
  password?: string; // Simple auth simulation
  rtmUsed: {
    indian: number;
    overseas: number;
  };
}

export interface Bid {
  id: string;
  teamId: string;
  teamName: string;
  teamLogo: string;
  amount: number;
  timestamp: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  isVisible: boolean;
  type: 'Title' | 'PoweredBy' | 'Associate';
}

export interface AuctionNotification {
  type: 'SOLD' | 'UNSOLD';
  player: Player;
  bid?: Bid;
}

export interface AuctionConfig {
  title: string;
  subTitle: string;
  location: string;
  broadcastLabel: string;
  tickerPrefix: string;
}

export interface BiddingTier {
  upTo: number;
  increment: number;
}

export interface RTMConfig {
  maxTotal: number;
  maxOverseas: number;
  maxIndian: number;
}

export interface TimeConfig {
  bidDuration: number;
  rtmDuration: number;
  breakDuration: number;
}

export interface AuctionRules {
  maxSquadSize: number;
  minSquadSize: number;
  maxOverseas: number;
  initialPurse: number;
  increments: BiddingTier[];
  rtmConfig: RTMConfig;
  timeConfig: TimeConfig;
}

export interface AuctionState {
  currentPlayerId: string | null;
  currentBid: number;
  bids: Bid[];
  isBiddingActive: boolean;
  lastActionMessage: string;
  rtmPending?: boolean;
  timerExpiresAt?: number | null; // Unix Timestamp for sync
  version?: number; // DB Concurrency Control: Increments on every update
  updatedAt?: number;
}
