import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BabyName, Matchup, User, Bet, Comment } from '../types';
import { calculateOdds, calculatePotentialPayout } from '../utils/odds';
import { supabase } from '../lib/supabase';

interface TournamentContextType {
  currentDay: number;
  currentMatchup: Matchup | null;
  matchups: Matchup[];
  names: BabyName[];
  users: User[];
  currentUser: User | undefined;
  bets: Bet[];
  comments: Comment[];
  loading: boolean;

  // Actions
  createUser: (name: string, role: 'parent' | 'bettor', avatar?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  loginByName: (name: string) => { success: boolean; message?: string };
  placeBet: (matchupId: number, nameId: string, amount: number) => Promise<{ success: boolean; message: string }>;
  advanceToNextDay: (winnerIdOverride?: string) => Promise<void>;
  addComment: (matchupId: number, text: string, nameId?: string) => Promise<void>;
  toggleParentFavorite: (nameId: string) => Promise<void>;
  resetTournament: () => Promise<void>;
}

const CURRENT_USER_KEY = 'prenom_tournament_current_user';

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

// ---------- Mappers: lignes Supabase (snake_case) -> types de l'app (camelCase) ----------

function mapBabyName(row: any): BabyName {
  return {
    id: row.id,
    name: row.name,
    gender: row.gender,
    origin: row.origin || '',
    meaning: row.meaning || '',
    style: row.style || '',
    popularity: row.popularity || 0,
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
    avatar: row.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
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

function buildMatchups(matchupRows: any[], namesById: Map<string, BabyName>): Matchup[] {
  return matchupRows
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
    }))
    .sort((a, b) => a.id - b.id);
}

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [names, setNames] = useState<BabyName[]>([]);
  const [matchups, setMatchups] = useState<Matchup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>(
    () => localStorage.getItem(CURRENT_USER_KEY) || ''
  );
  const [bets, setBets] = useState<Bet[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------- Chargement initial depuis Supabase ----------
  const fetchAll = useCallback(async () => {
    const [namesRes, matchupsRes, usersRes, betsRes, commentsRes] = await Promise.all([
      supabase.from('baby_names').select('*').order('seed', { ascending: true }),
      supabase.from('matchups').select('*').order('id', { ascending: true }),
      supabase.from('users').select('*').order('created_at', { ascending: true }),
      supabase.from('bets').select('*').order('created_at', { ascending: false }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }),
    ]);

    const mappedNames = (namesRes.data || []).map(mapBabyName);
    const namesById = new Map(mappedNames.map((n) => [n.id, n]));

    setNames(mappedNames);
    setMatchups(buildMatchups(matchupsRes.data || [], namesById));
    setUsers((usersRes.data || []).map(mapUser));
    setBets((betsRes.data || []).map(mapBet));
    setComments((commentsRes.data || []).map(mapComment));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();

    // Abonnement temps réel : dès qu'une table change, on recharge tout
    // (simple et fiable pour ce volume de données ; on optimisera si besoin plus tard)
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

  const currentUser = users.find((u) => u.id === currentUserId);

  const currentMatchup = matchups.find((m) => m.status === 'live') || matchups[0] || null;
  const currentDay = currentMatchup?.dayNumber || 1;

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    localStorage.setItem(CURRENT_USER_KEY, userId);
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(CURRENT_USER_KEY);
  };

  const loginByName = (name: string): { success: boolean; message?: string } => {
    const match = users.find((u) => u.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (!match) {
      return { success: false, message: 'Aucun profil trouvé avec ce pseudo. Vérifie l\'orthographe ou crée un nouveau profil.' };
    }
    switchUser(match.id);
    return { success: true };
  };

  const createUser = async (
    name: string,
    role: 'parent' | 'bettor',
    avatar?: string
  ): Promise<{ success: boolean; message?: string }> => {
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

    if (error) {
      console.error('[createUser] Erreur Supabase :', error);
      return {
        success: false,
        message: error.message.includes('duplicate')
          ? 'Ce pseudo est déjà pris — choisis-en un légèrement différent (ex: ajoute ton nom de famille ou une initiale).'
          : `Erreur : ${error.message}`,
      };
    }

    if (data) {
      switchUser(data.id);
      return { success: true };
    }

    return { success: false, message: 'Erreur inconnue lors de la création du profil.' };
  };

  const placeBet = async (
    matchupId: number,
    nameId: string,
    amount: number
  ): Promise<{ success: boolean; message: string }> => {
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

    const { oddsA, oddsB } = calculateOdds(targetMatchup.votesA, targetMatchup.votesB);
    const oddsAtBetTime = isA ? oddsA : oddsB;
    const potentialPayout = calculatePotentialPayout(amount, oddsAtBetTime);

    // 1) Enregistrer le pari
    const { error: betError } = await supabase.from('bets').insert({
      user_id: currentUser.id,
      matchup_id: matchupId,
      chosen_name_id: nameId,
      chosen_name: chosenNameObj.name,
      points_bet: amount,
      odds_at_bet_time: oddsAtBetTime,
      potential_payout: potentialPayout,
      status: 'active',
      day_bet: currentDay,
    });

    if (betError) {
      return {
        success: false,
        message: betError.message.includes('duplicate')
          ? 'Tu as déjà parié sur ce match.'
          : `Erreur : ${betError.message}`,
      };
    }

    // 2) Débiter les points du joueur
    await supabase
      .from('users')
      .update({
        points: currentUser.points - amount,
        total_bets_count: currentUser.totalBetsCount + 1,
      })
      .eq('id', currentUser.id);

    // 3) Mettre à jour la cagnotte du match
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
    const activeMatchup = matchups.find((m) => m.status === 'live');

    if (!activeMatchup) {
      console.error('[advanceToNextDay] Aucun match "live" trouvé. Matchups actuels :', matchups);
      alert('Erreur : aucun match en cours (statut "live") trouvé. Vérifie que le tableau a bien été généré.');
      return;
    }
    if (!activeMatchup.nameA || !activeMatchup.nameB) {
      console.error('[advanceToNextDay] Match incomplet :', activeMatchup);
      alert(
        `Erreur : ce match n'a pas ses deux prénoms définis (nameA=${activeMatchup.nameA?.name ?? 'null'}, nameB=${activeMatchup.nameB?.name ?? 'null'}).`
      );
      return;
    }

    console.log('[advanceToNextDay] Démarrage pour le match', activeMatchup.id, activeMatchup.nameA.name, 'vs', activeMatchup.nameB.name);

    let winningName: BabyName;
    if (winnerIdOverride) {
      winningName =
        activeMatchup.nameA.id === winnerIdOverride ? activeMatchup.nameA : activeMatchup.nameB;
    } else if (activeMatchup.votesA > activeMatchup.votesB) {
      winningName = activeMatchup.nameA;
    } else if (activeMatchup.votesB > activeMatchup.votesA) {
      winningName = activeMatchup.nameB;
    } else {
      winningName =
        activeMatchup.nameA.seed < activeMatchup.nameB.seed ? activeMatchup.nameA : activeMatchup.nameB;
    }

    // 1) Résoudre les paris de ce match
    const matchBets = bets.filter((b) => b.matchupId === activeMatchup.id && b.status === 'active');

    for (const bet of matchBets) {
      const isWin = bet.chosenNameId === winningName.id;
      const payout = isWin ? Math.round(bet.pointsBet * bet.oddsAtBetTime) : 0;

      await supabase
        .from('bets')
        .update({ status: isWin ? 'won' : 'lost', payout_amount: payout })
        .eq('id', bet.id);

      if (isWin) {
        const bettor = users.find((u) => u.id === bet.userId);
        if (bettor) {
          await supabase
            .from('users')
            .update({
              points: bettor.points + payout,
              total_won: bettor.totalWon + (payout - bet.pointsBet),
              winning_bets_count: bettor.winningBetsCount + 1,
            })
            .eq('id', bettor.id);
        }
      }
    }

    // 2) Marquer le match comme terminé
    await supabase
      .from('matchups')
      .update({ winner_id: winningName.id, status: 'completed' })
      .eq('id', activeMatchup.id);

    // 3) Faire avancer le vainqueur au tour suivant (slot A ou B du prochain match)
    const round = activeMatchup.round;
    const matchesThisRound = matchups.filter((m) => m.round === round).sort((a, b) => a.id - b.id);
    const indexInRound = matchesThisRound.findIndex((m) => m.id === activeMatchup.id);

    if (round < 6) {
      const nextRoundMatches = matchups.filter((m) => m.round === round + 1).sort((a, b) => a.id - b.id);
      const nextMatch = nextRoundMatches[Math.floor(indexInRound / 2)];
      if (nextMatch) {
        const slot = indexInRound % 2 === 0 ? 'name_a_id' : 'name_b_id';
        await supabase.from('matchups').update({ [slot]: winningName.id }).eq('id', nextMatch.id);
      }
    }

    // 4) Activer le match du jour suivant
    const nextDayMatch = matchups.find((m) => m.dayNumber === activeMatchup.dayNumber + 1);
    if (nextDayMatch) {
      await supabase.from('matchups').update({ status: 'live' }).eq('id', nextDayMatch.id);
    }

    await fetchAll();
  };

  const addComment = async (matchupId: number, text: string, nameId?: string) => {
    if (!text.trim()) return;
    await supabase.from('comments').insert({
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar,
      matchup_id: matchupId,
      name_id: nameId || null,
      text: text.trim(),
    });
  };

  const toggleParentFavorite = async (nameId: string) => {
    const target = names.find((n) => n.id === nameId);
    if (!target) return;
    await supabase
      .from('baby_names')
      .update({ parent_favorite: !target.parentFavorite })
      .eq('id', nameId);
  };

  const resetTournament = async () => {
    // 1) Supprime tous les paris et commentaires
    await supabase.from('bets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2) Supprime tous les matchs (le tableau devra être régénéré depuis "Gérer les Prénoms")
    await supabase.from('matchups').delete().neq('id', -1);

    // 3) Remet tous les utilisateurs à 1000 points et stats à zéro
    for (const u of users) {
      await supabase
        .from('users')
        .update({ points: 1000, total_won: 0, total_bets_count: 0, winning_bets_count: 0 })
        .eq('id', u.id);
    }

    // 4) Retire les favoris parent (garde les prénoms eux-mêmes)
    await supabase
      .from('baby_names')
      .update({ parent_favorite: false })
      .neq('id', '00000000-0000-0000-0000-000000000000');
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
        createUser,
        logout,
        loginByName,
        placeBet,
        advanceToNextDay,
        addComment,
        toggleParentFavorite,
        resetTournament,
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
