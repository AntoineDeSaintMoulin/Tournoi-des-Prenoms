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

  const roundsInfo = [
    { number: 1, label: '1er Tour', count: 32, badge: '64 Prénoms', id: 'col-round-1' },
    { number: 2, label: '2e Tour', count: 16, badge: '32 Prénoms', id: 'col-round-2' },
    { number: 3, label: '8ème de Finale', count: 8, badge: '16 Prénoms', id: 'col-round-3' },
    { number: 4, label: 'Quarts de Finale', count: 4, badge: '8 Prénoms', id: 'col-round-4' },
    { number: 5, label: 'Demi-Finales', count: 2, badge: '4 Prénoms', id: 'col-round-5' },
    { number: 6, label: 'Grande Finale', count: 1, badge: 'Champion', id: 'col-round-6' },
  ];

  // Helper to scroll to a specific round column inside the horizontal bracket container
  const scrollToColumn = (colId: string) => {
    const el = document.getElementById(colId);
    if (el && scrollContainerRef.current) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  };

  // Get final match & winner if present
  const finalMatch = matchups.find((m) => m.id === 63);
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
  const visibleRounds = roundsInfo.filter((r) => {
    if (bracketScope === 'r16') return r.number >= 3; // From 8èmes onwards
    if (bracketScope === 'finals') return r.number >= 4; // Quarts, Demis, Finale
    return true; // 'all'
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Controls & Header Bar */}
      <div className="bg-[#0f0f12] border border-[#2d2d2a] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c4a661]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 border border-[#c4a661] bg-[#1a1a1c] flex items-center justify-center rotate-45 shadow-xl shadow-[#c4a661]/10">
              <Trophy className="w-6 h-6 text-[#c4a661] -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif tracking-wide text-[#f4f4f0] uppercase font-bold">
                  Arbre du Tournoi
                </h2>
                <span className="bg-[#c4a661]/20 border border-[#c4a661]/40 text-[#c4a661] text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                  63 Duels • 6 Tours
                </span>
              </div>
              <p className="text-xs text-[#8a8a80] mt-1 font-sans">
                Tableau complet à élimination directe. Cliquez sur un duel pour consulter les votes et placer vos paris.
              </p>
            </div>
          </div>

          {/* Controls: Mode Switcher & Search */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#8a8a80] absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Chercher un prénom..."
                className="w-full bg-[#0a0a0b] border border-[#2d2d2a] rounded-xl pl-9 pr-3 py-2 text-xs text-[#e0e0d6] placeholder-[#55554e] focus:border-[#c4a661] outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[10px] text-[#8a8a80] hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#0a0a0b] border border-[#2d2d2a] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('bracket')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'bracket'
                    ? 'bg-[#c4a661] text-black shadow-lg shadow-[#c4a661]/20'
                    : 'text-[#8a8a80] hover:text-[#e0e0d6]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                Arbre Tableau
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-[#c4a661] text-black shadow-lg shadow-[#c4a661]/20'
                    : 'text-[#8a8a80] hover:text-[#e0e0d6]'
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
          <div className="mt-6 pt-4 border-t border-[#2d2d2a] flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Scope zoom filters */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-[#8a8a80] font-mono">
                Portée :
              </span>
              <button
                onClick={() => setBracketScope('all')}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  bracketScope === 'all'
                    ? 'bg-[#1a1a1c] border-[#c4a661] text-[#c4a661]'
                    : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#8a8a80] hover:text-[#e0e0d6]'
                }`}
              >
                Tout l'Arbre (64)
              </button>
              <button
                onClick={() => setBracketScope('r16')}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  bracketScope === 'r16'
                    ? 'bg-[#1a1a1c] border-[#c4a661] text-[#c4a661]'
                    : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#8a8a80] hover:text-[#e0e0d6]'
                }`}
              >
                8èmes de Finale (16)
              </button>
              <button
                onClick={() => setBracketScope('finals')}
                className={`px-3 py-1 rounded-lg border text-[11px] font-bold transition-all ${
                  bracketScope === 'finals'
                    ? 'bg-[#1a1a1c] border-[#c4a661] text-[#c4a661]'
                    : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#8a8a80] hover:text-[#e0e0d6]'
                }`}
              >
                Quarts / Demis / Finale (8)
              </button>
            </div>

            {/* Quick scroll column jumps */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[10px] uppercase tracking-widest text-[#8a8a80] font-mono mr-1">
                Aller à :
              </span>
              {roundsInfo.map((r) => (
                <button
                  key={r.number}
                  onClick={() => scrollToColumn(r.id)}
                  className="px-2.5 py-1 bg-[#1a1a1c] hover:bg-[#2d2d2a] border border-[#2d2d2a] hover:border-[#c4a661] text-[10px] uppercase tracking-wider text-[#e0e0d6] rounded-md transition-all whitespace-nowrap"
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
        <div className="bg-[#0f0f12] border border-[#2d2d2a] rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden relative">
          <div className="flex items-center justify-between text-[11px] text-[#8a8a80] uppercase tracking-widest pb-3 mb-4 border-b border-[#2d2d2a] font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c4a661]" />
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
                    <div className="mb-6 p-3 bg-[#161618] border-b-2 border-[#c4a661] text-center rounded-t-xl shadow-md">
                      <span className="text-[10px] uppercase tracking-widest text-[#c4a661] font-mono font-bold block">
                        {roundObj.badge}
                      </span>
                      <h3 className="text-sm font-serif font-bold text-[#f4f4f0] uppercase tracking-wider">
                        {roundObj.label}
                      </h3>
                      <p className="text-[10px] text-[#8a8a80] font-mono mt-0.5">
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
                              className={`group cursor-pointer bg-[#161618] border rounded-2xl p-3 shadow-xl transition-all duration-300 hover:scale-[1.02] hover:z-20 relative overflow-hidden ${
                                isSearchMatch
                                  ? 'ring-2 ring-[#c4a661] shadow-[0_0_20px_rgba(196,166,97,0.4)] border-[#c4a661]'
                                  : isLive
                                  ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                                  : isCompleted
                                  ? 'border-[#2d2d2a] hover:border-[#c4a661]/60'
                                  : 'border-[#2d2d2a]/80 opacity-85 hover:opacity-100 hover:border-[#2d2d2a]'
                              }`}
                            >
                              {/* Header Metadata */}
                              <div className="flex items-center justify-between text-[10px] font-mono mb-2 pb-1.5 border-b border-[#2d2d2a] text-[#8a8a80]">
                                <span className="flex items-center gap-1 font-bold text-[#c4a661]">
                                  <Calendar className="w-3 h-3" />
                                  J#{matchup.dayNumber}
                                </span>
                                {isLive ? (
                                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    EN DIRECT
                                  </span>
                                ) : isCompleted ? (
                                  <span className="text-[#8a8a80] font-semibold uppercase">Terminé</span>
                                ) : (
                                  <span className="text-[#55554e] font-semibold uppercase">À venir</span>
                                )}
                              </div>

                              {/* CANDIDATE A */}
                              <div
                                className={`p-2 rounded-xl border mb-1.5 flex items-center justify-between transition-all ${
                                  matchup.winnerId === matchup.nameA?.id
                                    ? 'bg-[#c4a661]/15 border-[#c4a661] text-[#f4f4f0] font-bold shadow-sm'
                                    : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#e0e0d6]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {matchup.nameA ? (
                                    <>
                                      <span className="text-[9px] bg-[#1a1a1c] text-[#c4a661] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2d2d2a]">
                                        #{matchup.nameA.seed}
                                      </span>
                                      <span className="text-xs font-serif font-bold truncate group-hover:text-[#c4a661] transition-colors">
                                        {matchup.nameA.name}
                                      </span>
                                      {matchup.nameA.parentFavorite && (
                                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-[#55554e] italic">En attente...</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                                  {matchup.winnerId === matchup.nameA?.id && (
                                    <Crown className="w-3.5 h-3.5 text-[#c4a661] fill-[#c4a661]" />
                                  )}
                                  {matchup.nameA && (
                                    <span className="text-[10px] font-bold text-[#c4a661] bg-[#1a1a1c] px-1.5 py-0.5 rounded border border-[#2d2d2a]">
                                      {formatOdds(oddsA)}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* CANDIDATE B */}
                              <div
                                className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                                  matchup.winnerId === matchup.nameB?.id
                                    ? 'bg-[#c4a661]/15 border-[#c4a661] text-[#f4f4f0] font-bold shadow-sm'
                                    : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#e0e0d6]'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {matchup.nameB ? (
                                    <>
                                      <span className="text-[9px] bg-[#1a1a1c] text-[#c4a661] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2d2d2a]">
                                        #{matchup.nameB.seed}
                                      </span>
                                      <span className="text-xs font-serif font-bold truncate group-hover:text-[#c4a661] transition-colors">
                                        {matchup.nameB.name}
                                      </span>
                                      {matchup.nameB.parentFavorite && (
                                        <Heart className="w-3 h-3 fill-rose-500 text-rose-500 shrink-0" />
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-[11px] text-[#55554e] italic">En attente...</span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                                  {matchup.winnerId === matchup.nameB?.id && (
                                    <Crown className="w-3.5 h-3.5 text-[#c4a661] fill-[#c4a661]" />
                                  )}
                                  {matchup.nameB && (
                                    <span className="text-[10px] font-bold text-[#c4a661] bg-[#1a1a1c] px-1.5 py-0.5 rounded border border-[#2d2d2a]">
                                      {formatOdds(oddsB)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Branch Connector lines linking pairs to next round */}
                            {roundObj.number < 6 && (
                              <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-8 h-px bg-[#2d2d2a] pointer-events-none hidden sm:block" />
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
                <div className="bg-gradient-to-b from-[#1a1a1c] via-[#0f0f12] to-[#0a0a0b] border-2 border-[#c4a661] rounded-3xl p-6 text-center shadow-2xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#c4a661]/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c4a661] via-amber-500 to-amber-700 flex items-center justify-center text-black mx-auto shadow-xl shadow-[#c4a661]/30 border border-[#c4a661]">
                    <Trophy className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-[9px] uppercase tracking-widest bg-[#c4a661]/20 text-[#c4a661] border border-[#c4a661]/30 font-bold px-3 py-1 rounded-full font-mono">
                      VAINQUEUR FINAL
                    </span>
                    <h3 className="text-2xl font-serif font-black text-[#f4f4f0] uppercase tracking-wide mt-3 mb-1">
                      {winnerObj ? winnerObj.name : '???'}
                    </h3>
                    {winnerObj ? (
                      <p className="text-xs text-[#c4a661] font-sans italic">
                        « {winnerObj.meaning} »
                      </p>
                    ) : (
                      <p className="text-xs text-[#8a8a80] font-mono">
                        Déterminé au Jour 63
                      </p>
                    )}
                  </div>

                  {winnerObj && (
                    <div className="p-3 bg-[#0a0a0b] border border-[#2d2d2a] rounded-xl text-[10px] text-[#8a8a80] text-left space-y-1">
                      <div className="flex justify-between">
                        <span>Origine :</span>
                        <span className="text-white font-bold">{winnerObj.origin}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Style :</span>
                        <span className="text-[#c4a661] font-bold">{winnerObj.style}</span>
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
                      ? 'bg-[#c4a661] text-black border-[#c4a661] font-bold shadow-xl shadow-[#c4a661]/20'
                      : 'bg-[#0f0f12] hover:bg-[#161618] border-[#2d2d2a] text-[#e0e0d6]'
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
                  className={`group cursor-pointer bg-[#0f0f12] border rounded-2xl p-4 transition-all duration-300 hover:shadow-2xl relative overflow-hidden ${
                    isLive
                      ? 'border-emerald-500/80 bg-emerald-950/20 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                      : isCompleted
                      ? 'border-[#2d2d2a] hover:border-[#c4a661]/60'
                      : 'border-[#2d2d2a] opacity-80 hover:opacity-100'
                  }`}
                >
                  {/* Match Header Tag */}
                  <div className="flex items-center justify-between text-xs mb-3 pb-2 border-b border-[#2d2d2a]">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#c4a661] flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#c4a661]" />
                      Jour #{matchup.dayNumber}
                    </span>

                    {isLive ? (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        EN DIRECT
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[10px] text-[#8a8a80] font-semibold uppercase font-mono">Terminé</span>
                    ) : (
                      <span className="text-[10px] text-[#55554e] font-semibold uppercase font-mono">À venir</span>
                    )}
                  </div>

                  {/* CANDIDATE A ROW */}
                  <div
                    className={`p-2.5 rounded-xl border mb-2 flex items-center justify-between transition-all ${
                      matchup.winnerId === matchup.nameA?.id
                        ? 'bg-[#c4a661]/15 border-[#c4a661] text-[#f4f4f0] font-bold'
                        : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#e0e0d6]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {matchup.nameA ? (
                        <>
                          <span className="text-[10px] bg-[#161618] text-[#c4a661] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2d2d2a]">
                            #{matchup.nameA.seed}
                          </span>
                          <span className="text-sm font-serif font-bold truncate group-hover:text-[#c4a661] transition-colors">
                            {matchup.nameA.name}
                          </span>
                          {matchup.nameA.parentFavorite && (
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[#55554e] italic">Vainqueur match précédent...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {matchup.winnerId === matchup.nameA?.id && (
                        <Crown className="w-4 h-4 text-[#c4a661] fill-[#c4a661]" />
                      )}
                      {matchup.nameA && (
                        <span className="text-xs font-mono font-bold text-[#c4a661] bg-[#161618] px-2 py-0.5 rounded border border-[#2d2d2a]">
                          {formatOdds(oddsA)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CANDIDATE B ROW */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                      matchup.winnerId === matchup.nameB?.id
                        ? 'bg-[#c4a661]/15 border-[#c4a661] text-[#f4f4f0] font-bold'
                        : 'bg-[#0a0a0b] border-[#2d2d2a] text-[#e0e0d6]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {matchup.nameB ? (
                        <>
                          <span className="text-[10px] bg-[#161618] text-[#c4a661] font-mono px-1.5 py-0.5 rounded font-bold border border-[#2d2d2a]">
                            #{matchup.nameB.seed}
                          </span>
                          <span className="text-sm font-serif font-bold truncate group-hover:text-[#c4a661] transition-colors">
                            {matchup.nameB.name}
                          </span>
                          {matchup.nameB.parentFavorite && (
                            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 shrink-0" />
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-[#55554e] italic">Vainqueur match précédent...</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {matchup.winnerId === matchup.nameB?.id && (
                        <Crown className="w-4 h-4 text-[#c4a661] fill-[#c4a661]" />
                      )}
                      {matchup.nameB && (
                        <span className="text-xs font-mono font-bold text-[#c4a661] bg-[#161618] px-2 py-0.5 rounded border border-[#2d2d2a]">
                          {formatOdds(oddsB)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom footer button */}
                  <div className="mt-3 text-center">
                    <span className="text-[11px] font-bold text-[#c4a661] hover:underline flex items-center justify-center gap-1 font-mono">
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
