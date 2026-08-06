import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatOdds, formatPoints } from '../utils/odds';
import { Coins, CheckCircle2, XCircle, Clock, X } from 'lucide-react';

interface BetsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetsHistoryModal: React.FC<BetsHistoryModalProps> = ({ isOpen, onClose }) => {
  const { bets, currentUser, matchups } = useTournament();

  if (!isOpen) return null;

  const userBets = bets.filter((b) => b.userId === currentUser.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6 max-h-[85vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Mes Paris — {currentUser.name}</h3>
            <p className="text-xs text-slate-400">
              Historique complet de vos pronostics et gains de points.
            </p>
          </div>
        </div>

        {/* User Balance Banner */}
        <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">Solde Actuel</div>
            <div className="text-2xl font-black text-amber-300 font-mono">{formatPoints(currentUser.points)}</div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>{userBets.length} paris placés</div>
            <div className="text-emerald-400 font-bold">
              {userBets.filter((b) => b.status === 'won').length} gagnés
            </div>
          </div>
        </div>

        {/* Bets List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {userBets.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-8">
              Vous n'avez pas encore placé de paris. Rendez-vous sur le Match du Jour pour miser vos 1 000 points !
            </p>
          ) : (
            userBets.map((bet) => {
              const match = matchups.find((m) => m.id === bet.matchupId);

              return (
                <div
                  key={bet.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 font-mono px-2 py-0.5 rounded font-bold">
                        Match #{match?.dayNumber || bet.dayBet}
                      </span>
                      <span className="text-sm font-black text-amber-300">{bet.chosenName}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      Mise : <strong className="text-slate-200">{bet.pointsBet} PTS</strong> à la cote de{' '}
                      <strong className="text-emerald-400">{formatOdds(bet.oddsAtBetTime)}</strong>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {bet.status === 'active' && (
                      <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> En cours ({bet.potentialPayout} PTS pot.)
                      </span>
                    )}

                    {bet.status === 'won' && (
                      <div className="text-right">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1 mb-1 justify-end">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Gagné !
                        </span>
                        <div className="text-xs font-mono font-black text-emerald-400">
                          +{bet.payoutAmount} PTS
                        </div>
                      </div>
                    )}

                    {bet.status === 'lost' && (
                      <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-400" /> Perdu
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
