import React, { useState } from 'react';
import { Matchup } from '../types';
import { useTournament } from '../context/TournamentContext';
import { calculateOdds, calculatePotentialPayout, formatOdds, formatPoints } from '../utils/odds';
import { Trophy, Swords, Volume2, Coins, CheckCircle2, Heart, Calendar, X } from 'lucide-react';

interface MatchDetailsModalProps {
  matchup: Matchup | null;
  onClose: () => void;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({ matchup, onClose }) => {
  const { placeBet, currentUser, toggleParentFavorite } = useTournament();
  const [selectedNameId, setSelectedNameId] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!matchup) return null;

  const { nameA, nameB, votesA, votesB, status, dayNumber, id } = matchup;
  const { oddsA, oddsB } = calculateOdds(votesA, votesB);

  const speakName = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleBetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNameId) {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un prénom.' });
      return;
    }
    const res = placeBet(id, selectedNameId, betAmount);
    if (res.success) {
      setMessage({ type: 'success', text: res.message });
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
              Match #{id} — Jour #{dayNumber}
            </div>
            <h3 className="text-xl font-black text-white">Détails de l'Affrontement</h3>
          </div>
        </div>

        {/* Both Candidates Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Candidate A */}
          {nameA ? (
            <div
              onClick={() => status === 'live' && setSelectedNameId(nameA.id)}
              className={`p-4 rounded-2xl border transition-all ${
                selectedNameId === nameA.id
                  ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Seed #{nameA.seed}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleParentFavorite(nameA.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Heart className={`w-4 h-4 ${nameA.parentFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-black text-white">{nameA.name}</h4>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakName(nameA.name);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 italic mb-3">« {nameA.meaning} »</p>

              <div className="text-xs font-mono font-bold text-emerald-400">
                Cote : {formatOdds(oddsA)}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 text-slate-500 italic text-xs text-center flex items-center justify-center">
              À déterminer (Vainqueur tour précédent)
            </div>
          )}

          {/* Candidate B */}
          {nameB ? (
            <div
              onClick={() => status === 'live' && setSelectedNameId(nameB.id)}
              className={`p-4 rounded-2xl border transition-all ${
                selectedNameId === nameB.id
                  ? 'bg-indigo-500/10 border-indigo-400 ring-2 ring-indigo-400/30'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Seed #{nameB.seed}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleParentFavorite(nameB.id);
                  }}
                  className="p-1 text-slate-500 hover:text-rose-400"
                >
                  <Heart className={`w-4 h-4 ${nameB.parentFavorite ? 'fill-rose-400 text-rose-400' : ''}`} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xl font-black text-white">{nameB.name}</h4>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakName(nameB.name);
                  }}
                  className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-400 italic mb-3">« {nameB.meaning} »</p>

              <div className="text-xs font-mono font-bold text-emerald-400">
                Cote : {formatOdds(oddsB)}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 text-slate-500 italic text-xs text-center flex items-center justify-center">
              À déterminer (Vainqueur tour précédent)
            </div>
          )}
        </div>

        {/* Betting Form inside Modal if Live */}
        {status === 'live' && nameA && nameB && (
          <form onSubmit={handleBetSubmit} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="text-xs font-bold text-slate-300">Parier sur ce match (Solde : {currentUser.points} PTS)</div>

            <div className="flex gap-2">
              <input
                type="number"
                min="10"
                max={currentUser.points}
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value, 10) || 0)}
                className="w-32 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300"
              />

              <button
                type="submit"
                disabled={!selectedNameId}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs py-2 rounded-xl transition-all"
              >
                Parier {betAmount} PTS
              </button>
            </div>

            {message && (
              <div
                className={`p-2.5 rounded-xl text-xs font-medium ${
                  message.type === 'success' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
                }`}
              >
                {message.text}
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};
