import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { calculateOdds, calculatePotentialPayout, formatOdds, formatPoints } from '../utils/odds';
import { BabyName } from '../types';
import {
  Swords,
  Volume2,
  Heart,
  Coins,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  Send,
  TrendingUp,
  Clock,
  Shield,
  Award,
  ChevronRight,
  Flame,
  Trophy,
} from 'lucide-react';

export const MatchOfTheDay: React.FC = () => {
  const {
    currentDay,
    currentMatchup,
    currentUser,
    placeBet,
    advanceToNextDay,
    comments,
    addComment,
    toggleParentFavorite,
  } = useTournament();

  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [customBetInput, setCustomBetInput] = useState<string>('100');
  const [betMessage, setBetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [commentText, setCommentText] = useState<string>('');

  if (!currentMatchup || !currentMatchup.nameA || !currentMatchup.nameB) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-300 my-8">
        <Trophy className="w-16 h-16 mx-auto text-amber-400 mb-4 animate-bounce" />
        <h2 className="text-2xl font-black text-white mb-2">Grande Finale du Tournoi !</h2>
        <p className="text-sm text-slate-400">Le gagnant officiel du grand tournoi des prénoms va bientôt être couronné.</p>
      </div>
    );
  }

  const nameA = currentMatchup.nameA;
  const nameB = currentMatchup.nameB;

  const { oddsA, oddsB } = calculateOdds(currentMatchup.votesA, currentMatchup.votesB);
  const totalVotes = currentMatchup.votesA + currentMatchup.votesB;
  const percentA = totalVotes > 0 ? Math.round((currentMatchup.votesA / totalVotes) * 100) : 50;
  const percentB = totalVotes > 0 ? 100 - percentA : 50;

  // Audio Speech synthesis function
  const speakName = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleQuickPreset = (amount: number) => {
    setBetAmount(amount);
    setCustomBetInput(amount.toString());
  };

  const handleCustomBetChange = (val: string) => {
    setCustomBetInput(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0) {
      setBetAmount(num);
    }
  };

  const handleConfirmBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNameId) {
      setBetMessage({ type: 'error', text: 'Veuillez sélectionner un prénom sur lequel parier.' });
      return;
    }

    const res = placeBet(currentMatchup.id, selectedNameId, betAmount);
    if (res.success) {
      setBetMessage({ type: 'success', text: res.message });
      setTimeout(() => setBetMessage(null), 5000);
    } else {
      setBetMessage({ type: 'error', text: res.message });
    }
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(currentMatchup.id, commentText, selectedNameId || undefined);
    setCommentText('');
  };

  const currentMatchupComments = comments.filter((c) => c.matchupId === currentMatchup.id);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Banner Match Header */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Match Metadata */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs uppercase px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
              <Flame className="w-4 h-4 fill-slate-950" />
              MATCH DU JOUR #{currentDay}
            </span>
            <span className="text-slate-400 text-xs font-semibold">
              Tour {currentMatchup.round} / 6 — Élimination directe
            </span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'parent' && (
              <button
                onClick={() => advanceToNextDay()}
                className="text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl shadow-md transition-all flex items-center gap-1"
              >
                Clôturer le Match & Avancer
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* VERSUS DUAL STAGE */}
        <div className="grid grid-cols-1 lg:grid-cols-11 gap-6 items-center">
          {/* CANDIDATE A */}
          <div
            onClick={() => setSelectedNameId(nameA.id)}
            className={`cursor-pointer group relative bg-slate-900/90 hover:bg-slate-850 border-2 rounded-2xl p-6 transition-all duration-300 shadow-xl lg:col-span-5 ${
              selectedNameId === nameA.id
                ? 'border-amber-400 bg-amber-500/5 shadow-amber-500/10 ring-2 ring-amber-400/30'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Seed badge & Parent favorite button */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                Tête de série #{nameA.seed}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleParentFavorite(nameA.id);
                }}
                className={`p-1.5 rounded-full border transition-all ${
                  nameA.parentFavorite
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-rose-400'
                }`}
                title="Coup de cœur des parents"
              >
                <Heart className={`w-4 h-4 ${nameA.parentFavorite ? 'fill-rose-400' : ''}`} />
              </button>
            </div>

            {/* Name Title & Audio button */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                {nameA.name}
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakName(nameA.name);
                }}
                className="p-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl transition-all"
                title="Écouter la prononciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Style & Gender Badges */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60">
                {nameA.origin}
              </span>
              <span className="bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {nameA.style}
              </span>
              <span className="bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Pop. {nameA.popularity}/100
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic mb-6">
              « {nameA.meaning} »
            </p>

            {/* Odds & Pari box */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cote actuelle</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {formatOdds(oddsA)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Paris cumulés</div>
                <div className="text-sm font-bold text-slate-200">
                  {formatPoints(currentMatchup.votesA)} ({percentA}%)
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedNameId === nameA.id && (
              <div className="mt-4 bg-amber-500 text-slate-950 font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4" /> Sélectionné pour pari
              </div>
            )}
          </div>

          {/* VS CENTER BADGE */}
          <div className="lg:col-span-1 flex flex-col items-center justify-center my-2 lg:my-0">
            <div className="w-14 h-14 rounded-full bg-slate-900 border-2 border-amber-500/40 flex items-center justify-center shadow-xl shadow-amber-500/10 relative z-10">
              <Swords className="w-7 h-7 text-amber-400" />
            </div>
            <div className="text-[11px] font-black uppercase text-amber-400 tracking-widest mt-2">
              VS
            </div>
          </div>

          {/* CANDIDATE B */}
          <div
            onClick={() => setSelectedNameId(nameB.id)}
            className={`cursor-pointer group relative bg-slate-900/90 hover:bg-slate-850 border-2 rounded-2xl p-6 transition-all duration-300 shadow-xl lg:col-span-5 ${
              selectedNameId === nameB.id
                ? 'border-amber-400 bg-amber-500/5 shadow-amber-500/10 ring-2 ring-amber-400/30'
                : 'border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Seed badge & Parent favorite button */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-md border border-amber-400/20">
                Tête de série #{nameB.seed}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleParentFavorite(nameB.id);
                }}
                className={`p-1.5 rounded-full border transition-all ${
                  nameB.parentFavorite
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-rose-400'
                }`}
                title="Coup de cœur des parents"
              >
                <Heart className={`w-4 h-4 ${nameB.parentFavorite ? 'fill-rose-400' : ''}`} />
              </button>
            </div>

            {/* Name Title & Audio button */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                {nameB.name}
              </h2>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speakName(nameB.name);
                }}
                className="p-2 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-xl transition-all"
                title="Écouter la prononciation"
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {/* Style & Gender Badges */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
              <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700/60">
                {nameB.origin}
              </span>
              <span className="bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/20">
                {nameB.style}
              </span>
              <span className="bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                Pop. {nameB.popularity}/100
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed italic mb-6">
              « {nameB.meaning} »
            </p>

            {/* Odds & Pari box */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cote actuelle</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {formatOdds(oddsB)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Paris cumulés</div>
                <div className="text-sm font-bold text-slate-200">
                  {formatPoints(currentMatchup.votesB)} ({percentB}%)
                </div>
              </div>
            </div>

            {/* Selection indicator */}
            {selectedNameId === nameB.id && (
              <div className="mt-4 bg-amber-500 text-slate-950 font-bold text-xs py-2 rounded-xl text-center flex items-center justify-center gap-1.5 shadow-lg">
                <CheckCircle2 className="w-4 h-4" /> Sélectionné pour pari
              </div>
            )}
          </div>
        </div>

        {/* Voting Ratio Visual Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-2 font-medium">
            <span>
              {nameA.name} : <strong className="text-amber-300">{percentA}% des voix</strong> ({currentMatchup.countA} parieurs)
            </span>
            <span>
              {nameB.name} : <strong className="text-indigo-300">{percentB}% des voix</strong> ({currentMatchup.countB} parieurs)
            </span>
          </div>

          <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-amber-500 to-amber-400 h-full rounded-l-full transition-all duration-500"
              style={{ width: `${percentA}%` }}
            />
            <div
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-r-full transition-all duration-500"
              style={{ width: `${percentB}%` }}
            />
          </div>
        </div>
      </div>

      {/* BETTING SLIP FORM */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Coupon de Pari — Match #{currentDay}</h3>
            <p className="text-xs text-slate-400">
              Choisissez un prénom, indiquez votre mise en points et validez votre prono !
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleConfirmBet} className="space-y-6">
          {/* Target Name selector buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedNameId(nameA.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedNameId === nameA.id
                  ? 'bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/30'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-slate-400 font-semibold mb-1">Parier sur</div>
              <div className="text-lg font-black text-amber-300">{nameA.name}</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">Cote : {formatOdds(oddsA)}</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedNameId(nameB.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedNameId === nameB.id
                  ? 'bg-indigo-500/20 border-indigo-400 text-white ring-2 ring-indigo-400/30'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="text-xs text-slate-400 font-semibold mb-1">Parier sur</div>
              <div className="text-lg font-black text-indigo-300">{nameB.name}</div>
              <div className="text-xs font-mono text-emerald-400 font-bold">Cote : {formatOdds(oddsB)}</div>
            </button>
          </div>

          {/* Quick Amount Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Montant de la mise (Vos points dispo : {formatPoints(currentUser.points)})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {[50, 100, 250, 500].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickPreset(amt)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    betAmount === amt
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  +{amt} PTS
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleQuickPreset(currentUser.points)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30"
              >
                TOUT MISER ({currentUser.points} PTS)
              </button>
            </div>

            {/* Custom Input */}
            <div className="relative max-w-xs">
              <input
                type="number"
                min="10"
                max={currentUser.points}
                value={customBetInput}
                onChange={(e) => handleCustomBetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white font-mono font-bold text-base focus:border-amber-400 focus:outline-none"
                placeholder="Montant personnalisé"
              />
              <span className="absolute right-3 top-3.5 text-xs text-amber-400 font-bold">PTS</span>
            </div>
          </div>

          {/* Potential Payout summary */}
          {selectedNameId && betAmount > 0 && (
            <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400">Gain Potentiel en cas de victoire :</div>
                <div className="text-xl font-black text-amber-300 font-mono">
                  {calculatePotentialPayout(
                    betAmount,
                    selectedNameId === nameA.id ? oddsA : oddsB
                  )}{' '}
                  PTS
                </div>
              </div>
              <div className="text-right text-xs text-slate-400 font-mono">
                Cote : {formatOdds(selectedNameId === nameA.id ? oddsA : oddsB)}
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {betMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-medium ${
                betMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
              }`}
            >
              {betMessage.text}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedNameId || betAmount <= 0}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-base py-4 rounded-2xl shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            <Coins className="w-5 h-5 fill-slate-950" />
            CONFIRMER LE PARI ({betAmount} PTS)
          </button>
        </form>
      </div>

      {/* COMMUNITY COMMENTS & DEBATE SECTION */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Le Mur des Supporters — Débat du jour</h3>
            <p className="text-xs text-slate-400">
              Mamie, parrain, marraine et amis partagent leur avis sur ce duel !
            </p>
          </div>
        </div>

        {/* Add comment form */}
        <form onSubmit={handleAddCommentSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={`Donnez votre avis au nom de ${currentUser.name}...`}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 text-sm"
          >
            <Send className="w-4 h-4" /> Poster
          </button>
        </form>

        {/* Comment list */}
        <div className="space-y-4">
          {currentMatchupComments.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-4">
              Aucun commentaire pour le moment. Soyez le premier à soutenir un prénom !
            </p>
          ) : (
            currentMatchupComments.map((c) => (
              <div key={c.id} className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex gap-3">
                <img src={c.userAvatar} alt={c.userName} className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{c.userName}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{c.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
