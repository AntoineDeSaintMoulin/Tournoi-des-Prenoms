export type Gender = 'boy' | 'girl' | 'unisex';

export interface BabyName {
  id: string;
  name: string;
  gender: Gender;
  origin: string;
  meaning: string;
  style: string; // e.g. 'Classique', 'Rétro', 'Moderne', 'Insolite', 'Court'
  popularity: number; // 1-100 score in France
  syllables?: number;
  parentFavorite?: boolean;
  seed: number; // 1-64 seed ranking
}

export interface Matchup {
  id: number; // 1 to 63
  round: 1 | 2 | 3 | 4 | 5 | 6; // 1: R64 (32 matches), 2: R32 (16), 3: R16 (8), 4: QF (4), 5: SF (2), 6: Final (1)
  dayNumber: number; // 1 to 63
  nameA: BabyName | null;
  nameB: BabyName | null;
  votesA: number; // Total points bet on A
  votesB: number; // Total points bet on B
  countA: number; // Count of unique users betting on A
  countB: number; // Count of unique users betting on B
  winnerId: string | null;
  status: 'upcoming' | 'live' | 'completed';
  parentChoiceId?: string | null;
}

export interface User {
  id: string;
  name: string;
  role: 'parent' | 'bettor';
  avatar: string;
  points: number;
  totalWon: number;
  totalBetsCount: number;
  winningBetsCount: number;
}

export interface Bet {
  id: string;
  userId: string;
  matchupId: number;
  chosenNameId: string;
  chosenName: string;
  pointsBet: number;
  oddsAtBetTime: number;
  potentialPayout: number;
  payoutAmount?: number;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  dayBet: number;
  timestamp: number;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  matchupId: number;
  nameId?: string;
  text: string;
  timestamp: number;
  likes: number;
}
