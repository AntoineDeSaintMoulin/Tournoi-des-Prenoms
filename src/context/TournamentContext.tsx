import React, { createContext, useContext, useState, useEffect } from 'react';
import { BabyName, Matchup, User, Bet, Comment } from '../types';
import { INITIAL_NAMES } from '../data/initialNames';
import { DEFAULT_USERS } from '../data/defaultUsers';
import { createInitialMatchups, getNextMatchupLocation } from '../utils/tournament';
import { calculateOdds, calculatePotentialPayout } from '../utils/odds';

interface TournamentContextType {
  currentDay: number;
  currentMatchup: Matchup | null;
  matchups: Matchup[];
  names: BabyName[];
  users: User[];
  currentUser: User;
  bets: Bet[];
  comments: Comment[];
  
  // Actions
  switchUser: (userId: string) => void;
  createUser: (name: string, role: 'parent' | 'bettor', avatar?: string) => void;
  placeBet: (matchupId: number, nameId: string, amount: number) => { success: boolean; message: string };
  advanceToNextDay: (winnerIdOverride?: string) => void;
  jumpToDay: (dayNumber: number) => void;
  resetTournament: () => void;
  addComment: (matchupId: number, text: string, nameId?: string) => void;
  toggleParentFavorite: (nameId: string) => void;
  seedSimulatedVotesForCurrentMatchup: () => void;
}

const STORAGE_KEY = 'prenom_tournament_v1';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [names, setNames] = useState<BabyName[]>(INITIAL_NAMES);
  const [matchups, setMatchups] = useState<Matchup[]>(() => createInitialMatchups(INITIAL_NAMES));
  const [users, setUsers] = useState<User[]>(DEFAULT_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>(DEFAULT_USERS[0].id);
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [bets, setBets] = useState<Bet[]>([]);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      userId: 'mamie_chantal',
      userName: 'Mamie Chantal',
      userAvatar: DEFAULT_USERS[1].avatar,
      matchupId: 1,
      text: 'Jules est le prénom de mon grand-père, un magnifique prénom noble et fort ! Je mise mes points !',
      timestamp: Date.now() - 3600000,
      likes: 4,
    },
    {
      id: 'c2',
      userId: 'tonton_thomas',
      userName: 'Tonton Thomas',
      userAvatar: DEFAULT_USERS[2].avatar,
      matchupId: 1,
      text: 'Zéphir a un charme poétique incroyable ! Ne sous-estimez pas l’outsider du tournoi !',
      timestamp: Date.now() - 1800000,
      likes: 2,
    },
  ]);

  // Load state from local storage on init
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.matchups && parsed.matchups.length === 63) {
          setNames(parsed.names || INITIAL_NAMES);
          setMatchups(parsed.matchups);
          setUsers(parsed.users || DEFAULT_USERS);
          setCurrentUserId(parsed.currentUserId || DEFAULT_USERS[0].id);
          setCurrentDay(parsed.currentDay || 1);
          setBets(parsed.bets || []);
          setComments(parsed.comments || []);
        }
      } else {
        // Seed initial simulated bets on Match 1 so odds look active right away!
        seedInitialBetsOnMatch1();
      }
    } catch (err) {
      console.error('Failed to load tournament state:', err);
    }
  }, []);

  // Save state to local storage on changes
  useEffect(() => {
    try {
      const stateToSave = {
        names,
        matchups,
        users,
        currentUserId,
        currentDay,
        bets,
        comments,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Failed to save tournament state:', err);
    }
  }, [names, matchups, users, currentUserId, currentDay, bets, comments]);

  const seedInitialBetsOnMatch1 = () => {
    // Seed initial votes on matchup 1 (Jules vs Zéphir)
    setMatchups((prev) =>
      prev.map((m) =>
        m.id === 1
          ? {
              ...m,
              status: 'live',
              votesA: 650,
              votesB: 250,
              countA: 3,
              countB: 1,
            }
          : m
      )
    );
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const currentMatchup = matchups.find((m) => m.dayNumber === currentDay) || matchups[0];

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
    }
  };

  const createUser = (name: string, role: 'parent' | 'bettor', avatar?: string) => {
    const newUser: User = {
      id: 'user_' + Date.now(),
      name,
      role,
      avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      points: 1000,
      totalWon: 0,
      totalBetsCount: 0,
      winningBetsCount: 0,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
  };

  const placeBet = (matchupId: number, nameId: string, amount: number) => {
    if (amount <= 0) {
      return { success: false, message: 'Le montant du pari doit être supérieur à 0 point.' };
    }

    if (currentUser.points < amount) {
      return { success: false, message: `Solde insuffisant ! Vous avez ${currentUser.points} points disponibles.` };
    }

    const targetMatchup = matchups.find((m) => m.id === matchupId);
    if (!targetMatchup) {
      return { success: false, message: 'Match introuvable.' };
    }

    if (targetMatchup.status !== 'live') {
      return { success: false, message: 'Les paris sont fermés pour ce match.' };
    }

    const isA = targetMatchup.nameA?.id === nameId;
    const isB = targetMatchup.nameB?.id === nameId;

    if (!isA && !isB) {
      return { success: false, message: 'Prénom invalide pour ce match.' };
    }

    const chosenNameObj = isA ? targetMatchup.nameA : targetMatchup.nameB;
    if (!chosenNameObj) return { success: false, message: 'Prénom non disponible.' };

    // Calculate odds before bet
    const { oddsA, oddsB } = calculateOdds(targetMatchup.votesA, targetMatchup.votesB);
    const oddsAtBetTime = isA ? oddsA : oddsB;
    const potentialPayout = calculatePotentialPayout(amount, oddsAtBetTime);

    // Create bet object
    const newBet: Bet = {
      id: 'bet_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: currentUser.id,
      matchupId,
      chosenNameId: nameId,
      chosenName: chosenNameObj.name,
      pointsBet: amount,
      oddsAtBetTime,
      potentialPayout,
      status: 'active',
      dayBet: currentDay,
      timestamp: Date.now(),
    };

    // Update user points
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? {
              ...u,
              points: u.points - amount,
              totalBetsCount: u.totalBetsCount + 1,
            }
          : u
      )
    );

    // Update matchup votes and bettors count
    setMatchups((prev) =>
      prev.map((m) => {
        if (m.id === matchupId) {
          return {
            ...m,
            votesA: isA ? m.votesA + amount : m.votesA,
            votesB: isB ? m.votesB + amount : m.votesB,
            countA: isA ? m.countA + 1 : m.countA,
            countB: isB ? m.countB + 1 : m.countB,
          };
        }
        return m;
      })
    );

    setBets((prev) => [newBet, ...prev]);

    return {
      success: true,
      message: `Pari confirmé ! ${amount} points placés sur ${chosenNameObj.name} à la cote de ${oddsAtBetTime.toFixed(2)}. Gain potentiel : ${potentialPayout} PTS.`,
    };
  };

  const advanceToNextDay = (winnerIdOverride?: string) => {
    if (currentDay > 63) return;

    const activeMatchup = matchups.find((m) => m.dayNumber === currentDay);
    if (!activeMatchup || !activeMatchup.nameA || !activeMatchup.nameB) return;

    // Determine winner
    let winningName: BabyName;
    if (winnerIdOverride) {
      winningName = activeMatchup.nameA.id === winnerIdOverride ? activeMatchup.nameA : activeMatchup.nameB;
    } else if (activeMatchup.votesA > activeMatchup.votesB) {
      winningName = activeMatchup.nameA;
    } else if (activeMatchup.votesB > activeMatchup.votesA) {
      winningName = activeMatchup.nameB;
    } else {
      // Tie-breaker: higher seed or parent choice
      winningName = activeMatchup.nameA.seed < activeMatchup.nameB.seed ? activeMatchup.nameA : activeMatchup.nameB;
    }

    // Calculate final odds for payout
    const { oddsA, oddsB } = calculateOdds(activeMatchup.votesA, activeMatchup.votesB);
    const finalWinningOdds = winningName.id === activeMatchup.nameA.id ? oddsA : oddsB;

    // Resolve bets for this matchup
    const updatedUsersMap = new Map<string, User>(users.map((u) => [u.id, { ...u }]));

    const updatedBets = bets.map((b) => {
      if (b.matchupId === activeMatchup.id && b.status === 'active') {
        const isWin = b.chosenNameId === winningName.id;
        const payout = isWin ? Math.round(b.pointsBet * b.oddsAtBetTime) : 0;

        if (isWin) {
          const userObj = updatedUsersMap.get(b.userId);
          if (userObj) {
            userObj.points += payout;
            userObj.totalWon += payout - b.pointsBet;
            userObj.winningBetsCount += 1;
          }
        }

        return {
          ...b,
          status: isWin ? ('won' as const) : ('lost' as const),
          payoutAmount: payout,
        };
      }
      return b;
    });

    setUsers(Array.from(updatedUsersMap.values()));
    setBets(updatedBets);

    // Update current matchup as completed with winner
    const nextLoc = getNextMatchupLocation(activeMatchup.id);

    setMatchups((prev) =>
      prev.map((m) => {
        if (m.id === activeMatchup.id) {
          return {
            ...m,
            winnerId: winningName.id,
            status: 'completed',
          };
        }

        // Advance winner to next bracket slot
        if (nextLoc && m.id === nextLoc.nextMatchupId) {
          return {
            ...m,
            nameA: nextLoc.slot === 'A' ? winningName : m.nameA,
            nameB: nextLoc.slot === 'B' ? winningName : m.nameB,
          };
        }

        // Activate next day's match
        if (m.dayNumber === currentDay + 1) {
          return {
            ...m,
            status: 'live',
          };
        }

        return m;
      })
    );

    // Increment day counter
    if (currentDay < 63) {
      setCurrentDay((d) => d + 1);
    }
  };

  const jumpToDay = (targetDay: number) => {
    if (targetDay < 1 || targetDay > 63) return;

    // Simulate days up to targetDay - 1 if jumping forward
    let updatedMatchups = [...matchups];

    for (let day = 1; day < targetDay; day++) {
      const match = updatedMatchups.find((m) => m.dayNumber === day);
      if (match && match.nameA && match.nameB && !match.winnerId) {
        // Pick winner by higher popularity seed or random
        const winner = match.nameA.popularity >= match.nameB.popularity ? match.nameA : match.nameB;
        match.winnerId = winner.id;
        match.status = 'completed';

        // Add dummy votes if 0
        if (match.votesA === 0 && match.votesB === 0) {
          match.votesA = Math.floor(Math.random() * 500) + 200;
          match.votesB = Math.floor(Math.random() * 500) + 150;
          match.countA = Math.floor(Math.random() * 5) + 1;
          match.countB = Math.floor(Math.random() * 5) + 1;
        }

        const nextLoc = getNextMatchupLocation(match.id);
        if (nextLoc) {
          const nextMatch = updatedMatchups.find((m) => m.id === nextLoc.nextMatchupId);
          if (nextMatch) {
            if (nextLoc.slot === 'A') nextMatch.nameA = winner;
            if (nextLoc.slot === 'B') nextMatch.nameB = winner;
          }
        }
      }
    }

    // Set target day match to live
    updatedMatchups = updatedMatchups.map((m) => {
      if (m.dayNumber === targetDay) {
        return {
          ...m,
          status: 'live',
          // Ensure dummy votes so odds look alive
          votesA: m.votesA || Math.floor(Math.random() * 400) + 100,
          votesB: m.votesB || Math.floor(Math.random() * 400) + 100,
          countA: m.countA || 2,
          countB: m.countB || 2,
        };
      }
      return m;
    });

    setMatchups(updatedMatchups);
    setCurrentDay(targetDay);
  };

  const seedSimulatedVotesForCurrentMatchup = () => {
    if (!currentMatchup) return;
    setMatchups((prev) =>
      prev.map((m) => {
        if (m.id === currentMatchup.id) {
          return {
            ...m,
            votesA: m.votesA + Math.floor(Math.random() * 300) + 100,
            votesB: m.votesB + Math.floor(Math.random() * 300) + 100,
            countA: m.countA + Math.floor(Math.random() * 3) + 1,
            countB: m.countB + Math.floor(Math.random() * 3) + 1,
          };
        }
        return m;
      })
    );
  };

  const resetTournament = () => {
    localStorage.removeItem(STORAGE_KEY);
    setNames(INITIAL_NAMES);
    const initialM = createInitialMatchups(INITIAL_NAMES);
    initialM[0].status = 'live';
    initialM[0].votesA = 650;
    initialM[0].votesB = 250;
    initialM[0].countA = 3;
    initialM[0].countB = 1;

    setMatchups(initialM);
    setUsers(DEFAULT_USERS);
    setCurrentUserId(DEFAULT_USERS[0].id);
    setCurrentDay(1);
    setBets([]);
    setComments([]);
  };

  const addComment = (matchupId: number, text: string, nameId?: string) => {
    if (!text.trim()) return;
    const newComment: Comment = {
      id: 'c_' + Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      matchupId,
      nameId,
      text: text.trim(),
      timestamp: Date.now(),
      likes: 0,
    };
    setComments((prev) => [newComment, ...prev]);
  };

  const toggleParentFavorite = (nameId: string) => {
    setNames((prev) =>
      prev.map((n) => (n.id === nameId ? { ...n, parentFavorite: !n.parentFavorite } : n))
    );
  };

  return (
    <TournamentContext.Provider
      value={{
        currentDay,
        currentMatchup,
        matchups,
        names,
        users,
        currentUser,
        bets,
        comments,
        switchUser,
        createUser,
        placeBet,
        advanceToNextDay,
        jumpToDay,
        resetTournament,
        addComment,
        toggleParentFavorite,
        seedSimulatedVotesForCurrentMatchup,
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
};
