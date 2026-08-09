import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Flame, Coins, Users, Sliders, Calendar, Sparkles, RefreshCw, Shield, ChevronDown, LogOut } from 'lucide-react';
import { formatPoints } from '../utils/odds';

interface HeaderProps {
  onOpenParentControls: () => void;
  onOpenBetsHistory: () => void;
  onOpenCreateUser: () => void;
  activeTab: 'match' | 'bracket' | 'leaderboard' | 'catalog' | 'manageNames';
  setActiveTab: (tab: 'match' | 'bracket' | 'leaderboard' | 'catalog' | 'manageNames') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenParentControls,
  onOpenBetsHistory,
  onOpenCreateUser,
  activeTab,
  setActiveTab,
}) => {
  const { currentDay, currentMatchup, currentUser, bets, logout } = useTournament();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const activeBetsCount = bets.filter((b) => b.userId === currentUser.id && b.status === 'active').length;
  const totalDays = 63;
  const progressPercent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-2xl">
      {/* Ticker tape bar */}
      <div className="bg-gradient-to-r from-amber-600 via-emerald-600 to-indigo-600 px-4 py-1.5 text-xs text-white font-medium flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-3 animate-pulse">
          <span className="bg-black/30 text-amber-200 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-400" />
            EN DIRECT - JOUR {currentDay} / 63
          </span>
          <span className="truncate hidden sm:inline">
            Match en cours : {currentMatchup?.nameA?.name || '???'} VS {currentMatchup?.nameB?.name || '???'} — Cotes en temps réel !
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold shrink-0">
          <span className="text-amber-200">1000 PTS Offerts</span>
          <span className="hidden md:inline">•</span>
          <span className="hidden md:inline text-slate-100">64 Prénoms en compétition</span>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/30">
            <Trophy className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                Tournoi des Prénoms
              </h1>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                63 Jours
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Du 1er candidat au prénom gagnant de bébé
            </p>
          </div>
        </div>

        {/* User Balance & Profile Switcher */}
        <div className="flex items-center gap-3">
          {/* User Points Badge */}
          <button
            onClick={onOpenBetsHistory}
            className="group relative bg-slate-900 hover:bg-slate-800 border border-amber-500/30 rounded-xl px-3.5 py-2 flex items-center gap-3 transition-all shadow-md hover:border-amber-500/60"
            title="Voir mes paris"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                Mon Solde
                {activeBetsCount > 0 && (
                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                    {activeBetsCount} en cours
                  </span>
                )}
              </div>
              <div className="text-sm font-extrabold text-amber-300 tracking-tight">
                {formatPoints(currentUser.points)}
              </div>
            </div>
          </button>

          {/* Profile Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-2 flex items-center gap-2.5 transition-all text-sm font-medium"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">{currentUser.name}</div>
                <div className="text-[10px] text-amber-400/80 font-medium capitalize">
                  {currentUser.role === 'parent' ? '👑 Organisateurs' : '🎯 Parieur'}
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-slate-200 text-xs">
                <div className="px-3 py-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-amber-400/50" />
                    <div>
                      <div className="font-bold text-slate-200">{currentUser.name}</div>
                      <div className="text-amber-400 font-mono text-[11px]">{currentUser.points} PTS</div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-lg transition-colors hover:bg-rose-500/10 text-rose-300 font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Changer de profil / Se déconnecter
                </button>
              </div>
            )}
          </div>

          {/* Admin / Parent Controls button */}
          <button
            onClick={onOpenParentControls}
            className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-amber-200 rounded-xl p-2.5 transition-all text-xs font-semibold flex items-center gap-1.5"
            title="Espace Parents & Simulateur de Tournoi"
          >
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Espace Parents</span>
          </button>
        </div>
      </div>

      {/* Progress Timeline bar */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Progression du Tournoi :</span>
            <span className="text-amber-300 font-extrabold">Jour {currentDay} sur 63</span>
          </div>

          {/* Progress bar container */}
          <div className="flex-1 max-w-xs sm:max-w-md bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mx-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('match')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'match'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Match du Jour
            </button>
            <button
              onClick={() => setActiveTab('bracket')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'bracket'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Arbre du Tournoi
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Classement
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Les Prénoms
            </button>
            {currentUser.role === 'parent' && (
              <button
                onClick={() => setActiveTab('manageNames')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === 'manageNames'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Gérer les Prénoms
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
