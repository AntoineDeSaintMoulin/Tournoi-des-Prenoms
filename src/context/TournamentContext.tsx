import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { BabyName, Matchup, User, Bet, Comment } from '../types';
import { calculateOdds, calculatePotentialPayout } from '../utils/odds';
import { getNextMatchupLocation } from '../utils/tournament';

interface TournamentContextType {
  currentDay: number;
  currentMatchup: Matchup | null;
  matchups: Matchup[];
  names: BabyName[];
  users: User[];
  currentUser: User;
  bets: Bet[];
  comments: Comment[];
  loading: boolean;

  switchUser: (userId: string) => void;
  createUser: (name: string, role: 'parent' | 'bettor', avatar?: string) => Promise<void>;
  placeBet: (matchupId: number, nameId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  advanceToNextDay: (winnerIdOverride?: string) => Promise<void>;
  addComment: (matchupId: number, text: string, nameId?: string) => Promise<void>;
  toggleParentFavorite: (nameId: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const CURRENT_USER_KEY = 'prenom_tournament_current_user_v1';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// ---- Mappers: snake_case (Supabase) -> camelCase (App types) ----

function mapName(row: any): BabyName {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    origin: row.origin || '',
    meaning: row.meaning || '',
    style: row.style || '',
    popularity: row.popularity || 50,
    syllables: row.syllables || undefined,
    parentFavorite: row.parent_favorite || false,
    seed: row.seed,
  };
}

function mapUser(row: any): User {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    avatar: row.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    points: Number(row.points),
    totalWon: Number(row.total_won),
    totalBetsCount: row.total_bets_count,
    winningBetsCount: row.winning_bets_count,
  };
}

function mapBet(row: any): Bet {
  return {
    id: row.id,
    userId: row.user_id,
    matchupId: row.matchup_id,
    chosenNameId: row.chosen_name_id,
    chosenName: row.chosen_name || '',
    pointsBet: Number(row.points_bet),
    oddsAtBetTime: Number(row.odds_at_bet_time),
    potentialPayout: Number(row.potential_payout),
    payoutAmount: row.payout_amount != null ? Number(row.payout_amount) : undefined,
    status: row.status,
    dayBet: row.day_bet,
    timestamp: new Date(row.created_at).getTime(),
  };
}

function mapComment(row: any): Comment {
  return {
    id: row.id,
    userId: row.user_id,
    userName: row.user_name || '',
    userAvatar: row.user_avatar || '',
    matchupId: row.matchup_id,
    nameId: row.name_id || undefined,
    text: row.text,
    timestamp: new Date(row.created_at).getTime(),
    likes: row.likes,
  };
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [names, setNames] = useState<BabyName[]>([]);
  const [rawMatchups, setRawMatchups] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(
    () => localStorage.getItem(CURRENT_USER_KEY)
  );
  const [loading, setLoading] = useState(true);

  // Assemble matchups (joining names by id, like the old local model)
  const namesById = new Map(names.map((n) => [n.id, n]));
  const matchups: Matchup[] = rawMatchups
    .sort((a, b) => a.id - b.id)
    .map((m) => ({
      id: m.id,
      round: m.round,
      dayNumber: m.day_number,
      nameA: m.name_a_id ? namesById.get(m.name_a_id) || null : null,
      nameB: m.name_b_id ? namesById.get(m.name_b_id) || null : null,
      votesA: Number(m.votes_a),
      votesB: Number(m.votes_b),
      countA: m.count_a,
      countB: m.count_b,
      winnerId: m.winner_id,
      status: m.status,
      parentChoiceId: m.parent_choice_id,
    }));

  const currentDay = matchups.find((m) => m.status === 'live')?.dayNumber
    || matchups.find((m) => m.status !== 'completed')?.dayNumber
    || 1;

  const currentMatchup = matchups.find((m) => m.dayNumber === currentDay) || null;
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];

  const fetchAll = useCallback(async () => {
    const [namesRes, matchupsRes, usersRes, betsRes, commentsRes] = await Promise.all([
      supabase.from('baby_names').select('*').order('seed', { ascending: true }),
      supabase.from('matchups').select('*').order('id', { ascending: true }),
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase.from('bets').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
    ]);

    if (namesRes.data) setNames(namesRes.data.map(mapName));
    if (matchupsRes.data) setRawMatchups(matchupsRes.data);
    if (usersRes.data) setUsers(usersRes.data.map(mapUser));
    if (betsRes.data) setBets(betsRes.data.map(mapBet));
    if (commentsRes.data) setComments(commentsRes.data.map(mapComment));

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel('tournament_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'baby_names' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matchups' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bets' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(CURRENT_USER_KEY, userId);
  };

  const createUser = async (name: string, role: 'parent' | 'bettor', avatar?: string) => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        role,
        avatar: avatar || null,
        points: 1000,
      })
      .select()
      .single();

    if (!error && data) {
      switchUser(data.id);
      await fetchAll();
    }
  };

  const placeBet = async (matchupId: number, nameId: string, amount: number) => {
    if (!currentUser) return { success: false, message: "Aucun utilisateur sélectionné." };
    if (amount <= 0) {
      return { success: false, message: 'Le montant du pari doit être supérieur à 0 point.' };
    }
    if (currentUser.points < amount) {
      return { success: false, message: `Solde insuffisant ! Vous avez ${currentUser.points} points disponibles.` };
    }

    const targetMatchup = matchups.find((m) => m.id === matchupId);
    if (!targetMatchup) return { success: false, message: 'Match introuvable.' };
    if (targetMatchup.status !== 'live') {
      return { success: false, message: 'Les paris sont fermés pour ce match.' };
    }

    const isA = targetMatchup.nameA?.id === nameId;
    const isB = targetMatchup.nameB?.id === nameId;
    if (!isA && !isB) return { success: false, message: 'Prénom invalide pour ce match.' };

    const chosenNameObj = isA ? targetMatchup.nameA : targetMatchup.nameB;
    if (!chosenNameObj) return { success: false, message: 'Prénom non disponible.' };

    const { oddsA, oddsB } = calculateOdds(targetMatchup.votesA, targetMatchup.votesB);
    const oddsAtBetTime = isA ? oddsA : oddsB;
    const potentialPayout = calculatePotentialPayout(amount, oddsAtBetTime);

    // 1. Insert the bet
    const { error: betError } = await supabase.from('bets').insert({
      user_id: currentUser.id,
      matchup_id: matchupId,
      chosen_name_id: nameId,
      chosen_name: chosenNameObj.name,
      points_bet: amount,
      odds_at_bet_time: oddsAtBetTime,
      potential_payout: potentialPayout,
      status: 'active',
      day_bet: targetMatchup.dayNumber,
    });

    if (betError) {
      return {
        success: false,
        message: betError.message.includes('duplicate')
          ? 'Tu as déjà parié sur ce match.'
          : betError.message,
      };
    }

    // 2. Deduct points from user
    await supabase
      .from('users')
      .update({
        points: currentUser.points - amount,
        total_bets_count: currentUser.totalBetsCount + 1,
      })
      .eq('id', currentUser.id);

    // 3. Update matchup pool totals
    await supabase
      .from('matchups')
      .update({
        votes_a: isA ? targetMatchup.votesA + amount : targetMatchup.votesA,
        votes_b: isB ? targetMatchup.votesB + amount : targetMatchup.votesB,
        count_a: isA ? targetMatchup.countA + 1 : targetMatchup.countA,
        count_b: isB ? targetMatchup.countB + 1 : targetMatchup.countB,
      })
      .eq('id', matchupId);

    await fetchAll();

    return {
      success: true,
      message: `Pari confirmé ! ${amount} points placés sur ${chosenNameObj.name} à la cote de ${oddsAtBetTime.toFixed(2)}. Gain potentiel : ${potentialPayout} PTS.`,
    };
  };

  const advanceToNextDay = async (winnerIdOverride?: string) => {
    const activeMatchup = matchups.find((m) => m.dayNumber === currentDay);
    if (!activeMatchup || !activeMatchup.nameA || !activeMatchup.nameB) return;

    let winningName: BabyName;
    if (winnerIdOverride) {
      winningName = activeMatchup.nameA.id === winnerIdOverride ? activeMatchup.nameA : activeMatchup.nameB;
    } else if (activeMatchup.votesA > activeMatchup.votesB) {
      winningName = activeMatchup.nameA;
    } else if (activeMatchup.votesB > activeMatchup.votesA) {
      winningName = activeMatchup.nameB;
    } else {
      winningName = activeMatchup.nameA.seed < activeMatchup.nameB.seed ? activeMatchup.nameA : activeMatchup.nameB;
    }

    const { oddsA, oddsB } = calculateOdds(activeMatchup.votesA, activeMatchup.votesB);
    const finalWinningOdds = winningName.id === activeMatchup.nameA.id ? oddsA : oddsB;
    void finalWinningOdds;

    // Resolve bets for this matchup
    const matchBets = bets.filter((b) => b.matchupId === activeMatchup.id && b.status === 'active');

    for (const bet of matchBets) {
      const isWin = bet.chosenNameId === winningName.id;
      const payout = isWin ? Math.round(bet.pointsBet * bet.oddsAtBetTime) : 0;

      await supabase
        .from('bets')
        .update({ status: isWin ? 'won' : 'lost', payout_amount: payout })
        .eq('id', bet.id);

      if (isWin) {
        const userObj = users.find((u) => u.id === bet.userId);
        if (userObj) {
          await supabase
            .from('users')
            .update({
              points: userObj.points + payout,
              total_won: userObj.totalWon + (payout - bet.pointsBet),
              winning_bets_count: userObj.winningBetsCount + 1,
            })
            .eq('id', userObj.id);
        }
      }
    }

    // Mark this matchup completed
    await supabase
      .from('matchups')
      .update({ winner_id: winningName.id, status: 'completed' })
      .eq('id', activeMatchup.id);

    // Advance winner to next bracket slot
    const nextLoc = getNextMatchupLocation(activeMatchup.id);
    if (nextLoc) {
      const nextRaw = rawMatchups.find((m) => m.id === nextLoc.nextMatchupId);
      if (nextRaw) {
        await supabase
          .from('matchups')
          .update({
            name_a_id: nextLoc.slot === 'A' ? winningName.id : nextRaw.name_a_id,
            name_b_id: nextLoc.slot === 'B' ? winningName.id : nextRaw.name_b_id,
          })
          .eq('id', nextLoc.nextMatchupId);
      }
    }

    // Activate next day's match
    const nextDayMatch = rawMatchups.find((m) => m.day_number === activeMatchup.dayNumber + 1);
    if (nextDayMatch) {
      await supabase.from('matchups').update({ status: 'live' }).eq('id', nextDayMatch.id);
    }

    await fetchAll();
  };

  const addComment = async (matchupId: number, text: string, nameId?: string) => {
    if (!text.trim() || !currentUser) return;
    await supabase.from('comments').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      matchup_id: matchupId,
      name_id: nameId || null,
      text: text.trim(),
    });
    await fetchAll();
  };

  const toggleParentFavorite = async (nameId: string) => {
    const nameObj = names.find((n) => n.id === nameId);
    if (!nameObj) return;
    await supabase
      .from('baby_names')
      .update({ parent_favorite: !nameObj.parentFavorite })
      .eq('id', nameId);
    await fetchAll();
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
        loading,
        switchUser,
        createUser,
        placeBet,
        advanceToNextDay,
        addComment,
        toggleParentFavorite,
        refreshAll: fetchAll,
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
