import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useTournament } from '../context/TournamentContext';
import { Trophy, X } from 'lucide-react';

const DISMISSED_KEY = 'prenom_tournament_winner_dismissed_v1';

export const WinnerTrophyModal: React.FC = () => {
  const { matchups, names } = useTournament();
  const [dismissed, setDismissed] = useState<boolean>(
    () => sessionStorage.getItem(DISMISSED_KEY) === 'true'
  );

  // Le match final est celui du tour le plus élevé (fonctionne quel que soit le nombre de prénoms)
  const finalMatch = matchups.length > 0
    ? matchups.reduce((max, m) => (m.round > max.round ? m : max), matchups[0])
    : null;
  const winnerId = finalMatch?.winnerId;
  const winnerObj = winnerId ? names.find((n) => n.id === winnerId) : null;

  useEffect(() => {
    if (winnerObj && !dismissed) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Le grand vainqueur du tournoi des prénoms est : ${winnerObj.name} !`
        );
        utterance.lang = 'fr-FR';
        window.speechSynthesis.speak(utterance);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winnerObj?.id]);

  if (!winnerObj || dismissed) return null;

  const handleClose = () => {
    sessionStorage.setItem(DISMISSED_KEY, 'true');
    setDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-950 border-2 border-amber-400 rounded-3xl max-w-lg w-full p-8 shadow-2xl text-center text-slate-100 space-y-6 relative overflow-hidden animate-in fade-in zoom-in duration-300">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors z-10"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 flex items-center justify-center text-slate-950 mx-auto shadow-2xl shadow-amber-500/40 border-4 border-amber-200">
          <Trophy className="w-14 h-14" />
        </div>

        <div>
          <span className="bg-amber-400 text-slate-950 font-black text-xs uppercase px-4 py-1 rounded-full tracking-widest">
            LE PRÉNOM GAGNANT DU TOURNOI
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-3 mb-2">
            {winnerObj.name}
          </h2>
          {winnerObj.meaning && (
            <p className="text-sm text-amber-300 font-semibold italic">
              « {winnerObj.meaning} »
            </p>
          )}
        </div>

        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-5 text-left space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400 font-medium">Origine & Style :</span>
            <span className="text-white font-bold">{winnerObj.origin || '—'} • {winnerObj.style || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400 font-medium">Candidats éliminés :</span>
            <span className="text-emerald-400 font-bold">{matchups.length} matchs joués !</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Félicitations aux futurs parents et à toute la communauté des parieurs qui ont voté durant ce tournoi !
        </p>

        <button
          onClick={handleClose}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg transition-all"
        >
          Voir le tableau final et le classement
        </button>
      </div>
    </div>
  );
};
