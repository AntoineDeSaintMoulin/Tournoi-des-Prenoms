import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Shield, Play, RotateCcw, Calendar, CheckCircle2, TrendingUp, X } from 'lucide-react';

interface ParentControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentControlsModal: React.FC<ParentControlsModalProps> = ({ isOpen, onClose }) => {
  const {
    currentDay,
    currentMatchup,
    advanceToNextDay,
    jumpToDay,
    resetTournament,
    seedSimulatedVotesForCurrentMatchup,
  } = useTournament();

  const [targetJumpDay, setTargetJumpDay] = useState<number>(currentDay);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Espace Parents — Contrôles & Simulation</h3>
            <p className="text-xs text-slate-400">
              Gérez le déroulement du tournoi sur 63 jours, qualifiez les candidats ou simulez la progression.
            </p>
          </div>
        </div>

        {/* Current Day Control */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Match du Jour actuel :</span>
            <span className="text-amber-400 font-mono">Jour #{currentDay} / 63</span>
          </div>

          {currentMatchup && currentMatchup.nameA && currentMatchup.nameB && (
            <div className="text-xs text-slate-400 bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="font-bold text-white">
                {currentMatchup.nameA.name} VS {currentMatchup.nameB.name}
              </span>
              <span className="text-emerald-400 font-mono">
                {currentMatchup.votesA + currentMatchup.votesB} PTS misés
              </span>
            </div>
          )}

          {/* Action 1: Advance Day */}
          <button
            onClick={() => {
              advanceToNextDay();
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Clôturer le Jour #{currentDay} & Passer au Jour #{currentDay + 1}
          </button>

          {/* Veto options */}
          {currentMatchup && currentMatchup.nameA && currentMatchup.nameB && (
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 mb-2">
                👑 Choisir le vainqueur officiel (Veto Parents) :
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    advanceToNextDay(currentMatchup.nameA!.id);
                  }}
                  className="bg-slate-900 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-800 text-slate-200 hover:text-amber-300 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Qualifier {currentMatchup.nameA.name}
                </button>
                <button
                  onClick={() => {
                    advanceToNextDay(currentMatchup.nameB!.id);
                  }}
                  className="bg-slate-900 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-800 text-slate-200 hover:text-amber-300 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  Qualifier {currentMatchup.nameB.name}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Time Travel / Jump to Day */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span>Sauter dans le temps (Simulateur) :</span>
            <span className="text-amber-400 font-mono">Jour {targetJumpDay}</span>
          </div>

          <input
            type="range"
            min="1"
            max="63"
            value={targetJumpDay}
            onChange={(e) => setTargetJumpDay(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500"
          />

          <button
            onClick={() => {
              jumpToDay(targetJumpDay);
            }}
            className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Aller au Jour #{targetJumpDay}
          </button>
        </div>

        {/* Simulated Votes Generator */}
        <button
          onClick={seedSimulatedVotesForCurrentMatchup}
          className="w-full bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          Injecter des paris aléatoires de la communauté
        </button>

        {/* Danger zone: Reset */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              if (confirm('Voulez-vous vraiment réinitialiser tout le tournoi au Jour 1 ?')) {
                resetTournament();
                onClose();
              }
            }}
            className="text-xs text-rose-400 hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Réinitialiser le tournoi à zéro
          </button>
        </div>
      </div>
    </div>
  );
};
