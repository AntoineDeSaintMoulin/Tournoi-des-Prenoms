import React, { useState, useRef } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Matchup } from '../types';
import { calculateOdds, formatOdds } from '../utils/odds';
import {
  Trophy,
  Crown,
  Calendar,
  Eye,
  Heart,
  Search,
  ChevronRight,
  Sparkles,
  Flame,
  LayoutGrid,
  GitBranch,
  ZoomIn,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface TournamentBracketProps {
  onSelectMatchup: (matchup: Matchup) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({ onSelectMatchup }) => {
  const { matchups, currentDay, names } = useTournament();
  const [viewMode, setViewMode] = useState<'bracket' | 'cards'>('bracket');
  const [bracketScope, setBracketScope] = useState<'all' | 'r16' | 'finals'>('all');
  const [selectedRoundTab, setSelectedRoundTab] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Labels standards, du plus proche de la finale vers le premier tour.
  // On les attribue en partant de la fin, pour que "Grande Finale" soit toujours
  // le dernier tour existant, quel que soit le nombre de prénoms en jeu.
  const STANDARD_LABELS_FROM_FINAL = [
    'Grande Finale',
    'Demi-Finales',
    'Quarts de Finale',
    '8ème de Finale',
    '2e Tour',
    '1er Tour',
  ];

  const maxRound = matchups.length > 0 ? Math.max(...matchups.map((m) => m.round)) : 1;

  const roundsInfo = Array.from({ length: maxRound }, (_, idx) => {
    const roundNumber = idx + 1;
    const matchesInRound = matchups.filter((m) => m.round === roundNumber).length;
    const distanceFromFinal = maxRound - roundNumber; // 0 = finale, 1 = demies, ...
    const label =
      STANDARD_LABELS_FROM_FINAL[distanceFromFinal] ?? `Tour ${roundNumber}`;
    const namesInPlay = matchesInRound * 2;

    return {
      number: roundNumber,
      label,
      count: matchesInRound,
      badge: roundNumber === maxRound ? 'Champion' : `${namesInPlay} Prénoms`,
      id: `col-round-${roundNumber}`,
    };
  });

  // Helper to scroll to a specific round column inside the horizontal bracket container
  const scrollToColumn = (colId: string) => {
    const el = document.getElementById(colId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  // Get final match & winner if present
  const finalMatch = matchups.length > 0
    ? matchups.reduce((max, m) => (m.round > max.round ? m : max), matchups[0])
    : undefined;
  const winnerId = finalMatch?.winnerId;
  const winnerObj = winnerId ? names.find((n) => n.id === winnerId) : null;

  // Filter matchups for cards list view
  const roundMatchups = matchups.filter((m) => m.round === selectedRoundTab);
  const filteredCardMatchups = roundMatchups.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.nameA?.name.toLowerCase().includes(q) ||
      m.nameB?.name.toLowerCase().includes(q) ||
      m.dayNumber.toString().includes(q)
    );
  });

  // Scope rounds to display in bracket tree based on bracketScope filter
  // (relatif à maxRound, pour fonctionner avec n'importe quelle taille de tableau)
  const visibleRounds = roundsInfo.filter((r) => {
    if (bracketScope === 'r16') return r.number >= maxRound - 3; // 8èmes onwards (ou tout si moins de tours)
    if (bracketScope === 'finals') return r.number >= maxRound - 2; // Quarts, Demis, Finale
    return true; // 'all'
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Controls & Header Bar */}
      <div className="bg-[#142a5a] border border-[#2b4f95] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffc61a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-[#ffc61a] bg-[#1a3369] flex items-center justify-center rotate-45 shadow-xl shadow-[#ffc61a]/10">
              <Trophy className="w-6 h-6 text-[#ffc61a] -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif tracking-wide text-[#ffffff] uppercase font-bold">
                  Arbre du Tournoi
                </h2>
                <span className="bg-[#ffc61a]/20 border border-[#ffc61a]/40 text-[#ffc61a] text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  {matchups.length} Duels • {maxRound} Tours
                </span>
              </div>
              <p className="text-xs text-[#86a6e0] mt-1 font-sans">
                Tableau complet à élimination directe. Cliquez sur un duel pour consulter les votes et placer vos paris.
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#86a6e0] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chercher un prénom..."
                className="w-full bg-[#0c1c40] border border-[#2b4f95] rounded-xl pl-9 pr-3 py-2 text-xs text-[#e6efff] placeholder-[#5f84c9] focus:border-[#ffc61a] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-[#86a6e0] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#0c1c40] border border-[#2b4f95] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('bracket')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'bracket'
                    ? 'bg-[#ffc61a] text-black shadow-lg shadow-[#ffc61a]/20'
                    : 'text-[#86a6e0] hover:text-[#e6efff]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Arbre Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-[#ffc61a] text-black shadow-lg shadow-[#ffc61a]/20'
                    : 'text-[#86a6e0] hover:text-[#e6efff]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Vue par Tours
              </button>
            </div>
          </div>
        </div>

        {/* Sub-bar for Bracket View options: Scope filter & Quick scroll jump */}
        {viewMode === 'bracket' && (
          <div className="mt-6 pt-4 border-t border-[#2b4f95] flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Scope zoom filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#86a6e0] font-mono">
                Portée :
              </span>
              <button
                onClick={() => setBracketScope('all')}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  bracketScope === 'all'
                    ? 'bg-[#1a3369] border-[#ffc61a] text-[#ffc61a]'
                    : 'bg-[#0c1c40] border-[#2b4f95] text-[#86a6e0] hover:text-[#e6efff]'
                }`}
              >
                Tout l'Arbre ({names.length})
              </button>
              <button
                onClick={() => setBracketScope('r16')}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  bracketScope === 'r16'
                    ? 'bg-[#1a3369] border-[#ffc61a] text-[#ffc61a]'
                    : 'bg-[#0c1c40] border-[#2b4f95] text-[#86a6e0] hover:text-[#e6efff]'
                }`}
              >
                8èmes de Finale (16)
              </button>
              <button
                onClick={() => setBracketScope('finals')}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  bracketScope === 'finals'
                    ? 'bg-[#1a3369] border-[#ffc61a] text-[#ffc61a]'
                    : 'bg-[#0c1c40] border-[#2b4f95] text-[#86a6e0] hover:text-[#e6efff]'
                }`}
              >
                Quarts / Demis / Finale (8)
              </button>
            </div>

            {/* Quick scroll column jumps */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] uppercase tracking-widest text-[#86a6e0] font-mono mr-1">
                Aller à :
              </span>
              {roundsInfo.map((r) => (
                <button
                  key={r.number}
                  onClick={() => scrollToColumn(r.id)}
                  className="px-2.5 py-1 bg-[#1a3369] hover:bg-[#2b4f95] border border-[#2b4f95] hover:border-[#ffc61a] text-[10px] uppercase tracking-wider text-[#e6efff] rounded-md transition-all whitespace-nowrap"
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* VIEW MODE 1: VISUAL BRACKET TREE / TABLEAU INTERACTIF      */}
      {/* ========================================================= */}
      {viewMode === 'bracket' && (
        <div className="bg-[#142a5a] border border-[#2b4f95] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between text-[11px] text-[#86a6e0] uppercase tracking-widest pb-3 mb-4 border-b border-[#2b4f95] font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ffc61a]" />
              Faites défiler horizontalement pour parcourir le tableau complet
            </span>
            <span>{visibleRounds.length} Tours affichés</span>
          </div>

          {/* Horizontal Scrollable Bracket Canvas */}
          <div
            ref={scrollContainerRef}
            className="overflow-x-auto custom-bracket-scroll pb-6 pt-2"
          >
            <div className="inline-flex gap-8 min-w-max items-stretch px-2">
              {visibleRounds.map((roundObj) => {
                const roundMatches = matchups.filter((m) => m.round === roundObj.number);

                return (
                  <div
                    key={roundObj.number}
                    id={roundObj.id}
                    className="w-64 sm:w-72 flex flex-col shrink-0"
                  >
                    {/* Column Header */}
                    <div className="mb-6 p-3 bg-[#142a5a] border-b-2 border-[#ffc61a] text-center rounded-t-xl shadow-md">
                      <span className="text-[10px] uppercase tracking-widest text-[#ffc61a] font-mono font-bold block">
                        {roundObj.badge}
                      </span>
                      <h3 className="text-sm font-serif font-bold text-[#ffffff] uppercase tracking-wider">
                        {roundObj.label}
                      </h3>
                      <p className="text-[10px] text-[#86a6e0] font-mono mt-0.5">
                        {roundMatches.filter((m) => m.status === 'completed').length} / {roundObj.count} terminés
                      </p>
                    </div>

                    {/* Round Matchup Stack */}
                    <div className="flex-1 flex flex-col justify-around gap-6 py-2">
                      {roundMatches.map((matchup, idx) => {
                        const isEvenPair = idx % 2 === 0;
                        const isLive = matchup.status === 'live';
                        const isCompleted = matchup.status === 'completed';

                        // Check if search query matches either candidate
                        const isSearchMatch =
                          searchQuery.length >= 2 &&
                          ((matchup.nameA?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                            (matchup.nameB?.name.toLowerCase().includes(searchQuery.toLowerCase()) ?? false));

                        const { oddsA, oddsB } = calculateOdds(matchup.votesA, matchup.votesB);

                        return (
                          <div
                            key={matchup.id}
                            className={`relative transition-all duration-300 ${
                              isEvenPair && roundObj.number < 6 ? 'mb-2' : ''
                            }`}
                          >
                            {/* Matchup Box */}
                            <div
                              onClick={() => onSelectMatchup(matchup)}
                              className={`group cursor-pointer bg-[#142a5a] border rounded-2xl p-3 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:z-20 relative overflow-hidden ${
                                isSearchMatch
                                  ? 'ring-2 ring-[#ffc61a] shadow-[0_0_20px_rgba(196,166,97,0.4)] border-[#ffc61a]'
                                  : isLive
                                  ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                                  : isCompleted
                                  ? 'border-[#2b4f95] hover:border-[#ffc61a]/60'
                                  : 'border-[#2b4f95]/80 opacity-85 hover:opacity-100 hover:border-[#2b4f95]'
                              }`}
                            >
                              {/* Header Metadata */}
                              <div className="flex items-center justify-between text-[10px] font-mono mb-2 pb-1.5 border-b border-[#2b4f95] text-[#86a6e0]">
                                <span className="flex items-center gap-1 font-bold text-[#ffc61a]">
                                  <Calendar className="w-3 h-3" />
                                  J#{matchup.dayNumber}
                                </span>
                                {isLive ? (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    EN DIRECT
                                  </span>
                                ) : isCompleted ? (
                                  <span className="text-[#86a6e0] font-semibold uppercase">Terminé</span>
                                ) : (
                                  <span className="text-[#5f84c9] font-semibold uppercase">À venir</span>
                                )}
                              </div>

                              {/* CANDIDATE A */}
                              <div
                                className={`p-2 rounded-xl border mb-1.5 flex items-center justify-between transition-all ${
                                  matchup.winnerId === matchup.nameA?.id
                                    ? 'bg-[#ffc61a]/15 border-[#ffc61a] text-[#ffffff] font-bold shadow-sm'
                                    : 'bg-[#0c1c40] border-[#2b4f95] text-[#e6efff]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {matchup.nameA ? (
                                    <>
                                      <span className="text-[9px] bg-[#1a3369] text-[#ffc61a] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2b4f95]">
                                        #{matchup.nameA.seed}
                                      </span>
                                      <span className="text-xs font-serif font-bold truncate group-hover:text-[#ffc61a] transition-colors">
                                        {matchup.nameA.name}
                                      </span>
                                      {matchup.nameA.parentFavorite && (
                                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-[#5f84c9] italic">En attente...</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                                  {matchup.winnerId === matchup.nameA?.id && (
                                    <Crown className="w-3.5 h-3.5 text-[#ffc61a] fill-[#ffc61a]" />
                                  )}
                                  {matchup.nameA && (
                                    <span className="text-[10px] font-bold text-[#ffc61a] bg-[#1a3369] px-1.5 py-0.5 rounded border border-[#2b4f95]">
                                      {formatOdds(oddsA)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* CANDIDATE B */}
                              <div
                                className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                                  matchup.winnerId === matchup.nameB?.id
                                    ? 'bg-[#ffc61a]/15 border-[#ffc61a] text-[#ffffff] font-bold shadow-sm'
                                    : 'bg-[#0c1c40] border-[#2b4f95] text-[#e6efff]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {matchup.nameB ? (
                                    <>
                                      <span className="text-[9px] bg-[#1a3369] text-[#ffc61a] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2b4f95]">
                                        #{matchup.nameB.seed}
                                      </span>
                                      <span className="text-xs font-serif font-bold truncate group-hover:text-[#ffc61a] transition-colors">
                                        {matchup.nameB.name}
                                      </span>
                                      {matchup.nameB.parentFavorite && (
                                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-[#5f84c9] italic">En attente...</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                                  {matchup.winnerId === matchup.nameB?.id && (
                                    <Crown className="w-3.5 h-3.5 text-[#ffc61a] fill-[#ffc61a]" />
                                  )}
                                  {matchup.nameB && (
                                    <span className="text-[10px] font-bold text-[#ffc61a] bg-[#1a3369] px-1.5 py-0.5 rounded border border-[#2b4f95]">
                                      {formatOdds(oddsB)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Branch Connector lines linking pairs to next round */}
                            {roundObj.number < 6 && (
                              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-px bg-[#2b4f95] pointer-events-none hidden sm:block" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Final Winner Champion Trophy Node */}
              <div className="w-64 sm:w-72 flex flex-col shrink-0 justify-center">
                <div className="bg-gradient-to-b from-[#1a3369] via-[#142a5a] to-[#0c1c40] border-2 border-[#ffc61a] rounded-3xl p-6 text-center shadow-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#ffc61a]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ffc61a] via-amber-500 to-amber-700 flex items-center justify-center text-black mx-auto shadow-xl shadow-[#ffc61a]/30 border border-[#ffc61a]">
                    <Trophy className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest bg-[#ffc61a]/20 text-[#ffc61a] border border-[#ffc61a]/30 font-bold px-3 py-1 rounded-full font-mono">
                      VAINQUEUR FINAL
                    </span>
                    <h3 className="text-2xl font-serif font-black text-[#ffffff] uppercase tracking-wide mt-3 mb-1">
                      {winnerObj ? winnerObj.name : '???'}
                    </h3>
                    {winnerObj ? (
                      <p className="text-xs text-[#ffc61a] font-sans italic">
                        « {winnerObj.meaning} »
                      </p>
                    ) : (
                      <p className="text-xs text-[#86a6e0] font-mono">
                        Déterminé au Jour {matchups.length}
                      </p>
                    )}
                  </div>

                  {winnerObj && (
                    <div className="p-3 bg-[#0c1c40] border border-[#2b4f95] rounded-xl text-[10px] text-[#86a6e0] text-left space-y-1">
                      <div className="flex justify-between">
                        <span>Origine :</span>
                        <span className="text-white font-bold">{winnerObj.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Style :</span>
                        <span className="text-[#ffc61a] font-bold">{winnerObj.style}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW MODE 2: CARDS LIST VIEW (FILTERED BY ROUND TABS)     */}
      {/* ========================================================= */}
      {viewMode === 'cards' && (
        <div className="space-y-6">
          {/* Round Navigation Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {roundsInfo.map((r) => {
              const isActive = selectedRoundTab === r.number;
              const roundMatches = matchups.filter((m) => m.round === r.number);
              const liveMatch = roundMatches.find((m) => m.status === 'live');

              return (
                <button
                  key={r.number}
                  onClick={() => setSelectedRoundTab(r.number)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isActive
                      ? 'bg-[#ffc61a] text-black border-[#ffc61a] font-bold shadow-xl shadow-[#ffc61a]/20'
                      : 'bg-[#142a5a] hover:bg-[#142a5a] border-[#2b4f95] text-[#e6efff]'
                  }`}
                >
                  {liveMatch && !isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  )}
                  <div className="text-[10px] uppercase tracking-wider opacity-80 font-mono">{r.badge}</div>
                  <div className="text-sm font-serif font-bold truncate">{r.label}</div>
                  <div className="text-[10px] font-mono mt-1 opacity-90">
                    {roundMatches.filter((m) => m.status === 'completed').length} / {r.count} faits
                  </div>
                </button>
              );
            })}
          </div>

          {/* Cards Grid for Selected Round */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCardMatchups.map((matchup) => {
              const isLive = matchup.status === 'live';
              const isCompleted = matchup.status === 'completed';

              const { oddsA, oddsB } = calculateOdds(matchup.votesA, matchup.votesB);

              return (
                <div
                  key={matchup.id}
                  onClick={() => onSelectMatchup(matchup)}
                  className={`group cursor-pointer bg-[#142a5a] border rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl relative overflow-hidden ${
                    isLive
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : isCompleted
                      ? 'border-[#2b4f95] hover:border-[#ffc61a]/60'
                      : 'border-[#2b4f95] opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Match Header Tag */}
                  <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-[#2b4f95]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#ffc61a] flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#ffc61a]" />
                      Jour #{matchup.dayNumber}
                    </span>

                    {isLive ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        EN DIRECT
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[10px] text-[#86a6e0] font-semibold uppercase font-mono">Terminé</span>
                    ) : (
                      <span className="text-[10px] text-[#5f84c9] font-semibold uppercase font-mono">À venir</span>
                    )}
                  </div>

                  {/* CANDIDATE A ROW */}
                  <div
                    className={`p-2.5 rounded-xl border mb-2 flex items-center justify-between transition-all ${
                      matchup.winnerId === matchup.nameA?.id
                        ? 'bg-[#ffc61a]/15 border-[#ffc61a] text-[#ffffff] font-bold'
                        : 'bg-[#0c1c40] border-[#2b4f95] text-[#e6efff]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {matchup.nameA ? (
                        <>
                          <span className="text-[10px] bg-[#142a5a] text-[#ffc61a] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2b4f95]">
                            #{matchup.nameA.seed}
                          </span>
                          <span className="text-sm font-serif font-bold truncate group-hover:text-[#ffc61a] transition-colors">
                            {matchup.nameA.name}
                          </span>
                          {matchup.nameA.parentFavorite && (
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[#5f84c9] italic">Vainqueur match précédent...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {matchup.winnerId === matchup.nameA?.id && (
                        <Crown className="w-4 h-4 text-[#ffc61a] fill-[#ffc61a]" />
                      )}
                      {matchup.nameA && (
                        <span className="text-xs font-mono font-bold text-[#ffc61a] bg-[#142a5a] px-2 py-0.5 rounded border border-[#2b4f95]">
                          {formatOdds(oddsA)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CANDIDATE B ROW */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      matchup.winnerId === matchup.nameB?.id
                        ? 'bg-[#ffc61a]/15 border-[#ffc61a] text-[#ffffff] font-bold'
                        : 'bg-[#0c1c40] border-[#2b4f95] text-[#e6efff]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {matchup.nameB ? (
                        <>
                          <span className="text-[10px] bg-[#142a5a] text-[#ffc61a] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2b4f95]">
                            #{matchup.nameB.seed}
                          </span>
                          <span className="text-sm font-serif font-bold truncate group-hover:text-[#ffc61a] transition-colors">
                            {matchup.nameB.name}
                          </span>
                          {matchup.nameB.parentFavorite && (
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[#5f84c9] italic">Vainqueur match précédent...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {matchup.winnerId === matchup.nameB?.id && (
                        <Crown className="w-4 h-4 text-[#ffc61a] fill-[#ffc61a]" />
                      )}
                      {matchup.nameB && (
                        <span className="text-xs font-mono font-bold text-[#ffc61a] bg-[#142a5a] px-2 py-0.5 rounded border border-[#2b4f95]">
                          {formatOdds(oddsB)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom footer button */}
                  <div className="mt-3 text-center">
                    <span className="text-[11px] font-bold text-[#ffc61a] hover:underline flex items-center justify-center gap-1 font-mono">
                      <Eye className="w-3.5 h-3.5" /> Voir détails & Paris
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
