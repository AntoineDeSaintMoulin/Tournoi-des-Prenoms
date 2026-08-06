import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { formatPoints } from '../utils/odds';
import { Trophy, Medal, Award, UserPlus, TrendingUp, Coins, Target } from 'lucide-react';

interface LeaderboardProps {
  onOpenCreateUser: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onOpenCreateUser }) => {
  const { users } = useTournament();

  // Sort users by points descending
  const sortedUsers = [...users].sort((a, b) => b.points - a.points);

  const top1 = sortedUsers[0];
  const top2 = sortedUsers[1];
  const top3 = sortedUsers[2];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Trophy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Le Podium des Parieurs</h2>
            <p className="text-xs text-slate-400">
              Classement général en temps réel calculé selon vos paris et gains de points.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateUser}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Rejoindre le Classement
        </button>
      </div>

      {/* TOP 3 PODIUM */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
        {/* 2ND PLACE */}
        {top2 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center relative shadow-xl order-2 md:order-1">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Medal className="w-3.5 h-3.5" /> 2ÈME PLACE
            </div>
            <img
              src={top2.avatar}
              alt={top2.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-slate-400 shadow-md mt-2"
            />
            <h3 className="text-lg font-bold text-white line-clamp-1">{top2.name}</h3>
            <p className="text-xs text-slate-400 capitalize mb-3">
              {top2.role === 'parent' ? '👑 Organisateurs' : '🎯 Parieur'}
            </p>
            <div className="text-2xl font-black text-amber-300 font-mono">{formatPoints(top2.points)}</div>
          </div>
        )}

        {/* 1ST PLACE */}
        {top1 && (
          <div className="bg-gradient-to-b from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-400 rounded-3xl p-8 text-center relative shadow-2xl shadow-amber-500/10 order-1 md:order-2 scale-105 z-10">
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black px-4 py-1 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
              <Trophy className="w-4 h-4 fill-slate-950" /> CHAMPION EN TÊTE
            </div>
            <img
              src={top1.avatar}
              alt={top1.name}
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-4 border-amber-400 shadow-xl mt-2"
            />
            <h3 className="text-xl font-black text-white line-clamp-1">{top1.name}</h3>
            <p className="text-xs text-amber-300 font-semibold uppercase tracking-wider mb-4">
              {top1.role === 'parent' ? '👑 Organisateurs' : '🎯 Parieur'}
            </p>
            <div className="text-3xl font-black text-amber-300 font-mono tracking-tight">
              {formatPoints(top1.points)}
            </div>
          </div>
        )}

        {/* 3RD PLACE */}
        {top3 && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center relative shadow-xl order-3">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-xs font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> 3ÈM PLACE
            </div>
            <img
              src={top3.avatar}
              alt={top3.name}
              className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-amber-700 shadow-md mt-2"
            />
            <h3 className="text-lg font-bold text-white line-clamp-1">{top3.name}</h3>
            <p className="text-xs text-slate-400 capitalize mb-3">
              {top3.role === 'parent' ? '👑 Organisateurs' : '🎯 Parieur'}
            </p>
            <div className="text-2xl font-black text-amber-300 font-mono">{formatPoints(top3.points)}</div>
          </div>
        )}
      </div>

      {/* FULL LEADERBOARD TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Classement Général ({sortedUsers.length} Parieurs)</span>
          <span>1 000 PTS offerts au départ</span>
        </div>

        <div className="divide-y divide-slate-800">
          {sortedUsers.map((user, idx) => {
            const winRate =
              user.totalBetsCount > 0 ? Math.round((user.winningBetsCount / user.totalBetsCount) * 100) : 0;

            return (
              <div
                key={user.id}
                className={`p-4 flex flex-wrap items-center justify-between gap-4 transition-colors ${
                  idx === 0 ? 'bg-amber-500/5' : 'hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black font-mono text-sm text-amber-400">
                    #{idx + 1}
                  </span>
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                  <div>
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      {user.name}
                      {idx === 0 && <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.2 rounded-full">LEADER</span>}
                    </div>
                    <div className="text-xs text-slate-400">
                      {user.totalBetsCount} paris plâces • {winRate}% de réusssite
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-amber-300 font-mono">
                    {formatPoints(user.points)}
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono">
                    {user.totalWon > 0 ? `+${user.totalWon} PTS remportés` : 'Solde initial'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
