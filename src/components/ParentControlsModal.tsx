import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Shield, Play, Calendar, X, RotateCcw } from 'lucide-react';

interface ParentControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ParentControlsModal: React.FC<ParentControlsModalProps> = ({ isOpen, onClose }) => {
  const { currentDay, currentMatchup, advanceToNextDay, resetTournament, currentUser } = useTournament();

  // Rempart final : même si ce modal est déclenché par erreur, un non-parent ne peut rien y faire.
  if (!isOpen) return null;
  if (!currentUser || currentUser.role !== 'parent') {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center text-slate-100 space-y-3">
          <Shield className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-bold">Accès réservé aux organisateurs.</p>
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white underline"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const handleReset = async () => {
    const firstConfirm = confirm(
      '⚠️ Ceci va supprimer TOUS les paris, matchs joués, et remettre tous les joueurs à 1000 points. Les 64 prénoms seront conservés. Continuer ?'
    );
    if (!firstConfirm) return;

    const secondConfirm = confirm(
      'Dernière confirmation : cette action est IRRÉVERSIBLE. Réinitialiser le tournoi maintenant ?'
    );
    if (!secondConfirm) return;

    await resetTournament();
    alert('Tournoi réinitialisé ! Va dans "Gérer les Prénoms" pour régénérer le tableau des matchs.');
    onClose();
  };

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
            <h3 className="text-xl font-black text-white">Espace Parents</h3>
            <p className="text-xs text-slate-400">
              Déclarez le vainqueur du jour pour faire avancer le tournoi.
            </p>
          </div>
        </div>

        {/* Current Day Control */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Match du Jour actuel :
            </span>
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

          {/* Auto: winner by most bets */}
          <button
            onClick={() => advanceToNextDay()}
            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            Clôturer le Jour #{currentDay} (vainqueur = le plus parié)
          </button>

          {/* Manual choice */}
          {currentMatchup && currentMatchup.nameA && currentMatchup.nameB && (
            <div className="pt-2">
              <div className="text-[11px] font-bold text-slate-400 mb-2">
                👑 Ou choisir directement le vainqueur officiel :
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => advanceToNextDay(currentMatchup.nameA!.id)}
                  className="bg-slate-900 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-800 text-slate-200 hover:text-amber-300 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  {currentMatchup.nameA.name}
                </button>
                <button
                  onClick={() => advanceToNextDay(currentMatchup.nameB!.id)}
                  className="bg-slate-900 hover:bg-amber-500/20 hover:border-amber-400 border border-slate-800 text-slate-200 hover:text-amber-300 text-xs font-bold py-2 rounded-xl transition-all"
                >
                  {currentMatchup.nameB.name}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Zone danger */}
        <div className="border-t border-slate-800 pt-4">
          <button
            onClick={handleReset}
            className="w-full bg-rose-950/40 hover:bg-rose-950/60 border border-rose-800/50 text-rose-300 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Réinitialiser tout le tournoi
          </button>
          <p className="text-[10px] text-slate-500 mt-2 text-center">
            Supprime tous les paris et matchs joués. Les 64 prénoms sont conservés.
          </p>
        </div>
      </div>
    </div>
  );
};
