import React, { useState } from 'react';
import { TournamentProvider, useTournament } from './context/TournamentContext';
import { Header } from './components/Header';
import { MatchOfTheDay } from './components/MatchOfTheDay';
import { TournamentBracket } from './components/TournamentBracket';
import { Leaderboard } from './components/Leaderboard';
import { NamesCatalog } from './components/NamesCatalog';
import { ManageNames } from './components/ManageNames';
import { ParentControlsModal } from './components/ParentControlsModal';
import { BetsHistoryModal } from './components/BetsHistoryModal';
import { CreateUserModal } from './components/CreateUserModal';
import { MatchDetailsModal } from './components/MatchDetailsModal';
import { WinnerTrophyModal } from './components/WinnerTrophyModal';
import { Matchup } from './types';
import { Trophy, Shield, Heart } from 'lucide-react';

function AppContent() {
  const { loading, currentUser } = useTournament();
  const [activeTab, setActiveTab] = useState<'match' | 'bracket' | 'leaderboard' | 'catalog' | 'manageNames'>('match');
  const [showParentControls, setShowParentControls] = useState<boolean>(false);
  const [showBetsHistory, setShowBetsHistory] = useState<boolean>(false);
  const [showCreateUser, setShowCreateUser] = useState<boolean>(false);
  const [selectedMatchup, setSelectedMatchup] = useState<Matchup | null>(null);

  // Chargement initial des données Supabase
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <Trophy className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
          <p className="text-sm text-slate-400">Chargement du tournoi...</p>
        </div>
      </div>
    );
  }

  // Aucun profil sélectionné : on force la création d'un compte avant d'aller plus loin
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
          <h1 className="text-xl font-black text-white">Bienvenue au Tournoi des Prénoms !</h1>
          <p className="text-sm text-slate-400">
            Crée ton profil pour commencer à parier sur le prénom gagnant.
          </p>
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
          >
            Créer mon profil
          </button>
        </div>
        <CreateUserModal isOpen={showCreateUser} onClose={() => setShowCreateUser(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-amber-500 selection:text-slate-950">
      {/* Sticky Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenParentControls={() => setShowParentControls(true)}
        onOpenBetsHistory={() => setShowBetsHistory(true)}
        onOpenCreateUser={() => setShowCreateUser(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'match' && <MatchOfTheDay />}
        {activeTab === 'bracket' && (
          <TournamentBracket onSelectMatchup={(matchup) => setSelectedMatchup(matchup)} />
        )}
        {activeTab === 'leaderboard' && (
          <Leaderboard onOpenCreateUser={() => setShowCreateUser(true)} />
        )}
        {activeTab === 'catalog' && <NamesCatalog />}
        {activeTab === 'manageNames' && <ManageNames />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">Tournoi des Prénoms de Bébé</span>
            <span>— 63 Jours & 1000 Points offerts</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setShowParentControls(true)}
              className="hover:text-amber-300 transition-colors flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" /> Espace Parents
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Fait avec <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> pour les futurs parents
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ParentControlsModal
        isOpen={showParentControls}
        onClose={() => setShowParentControls(false)}
      />
      <BetsHistoryModal
        isOpen={showBetsHistory}
        onClose={() => setShowBetsHistory(false)}
      />
      <CreateUserModal
        isOpen={showCreateUser}
        onClose={() => setShowCreateUser(false)}
      />
      <MatchDetailsModal
        matchup={selectedMatchup}
        onClose={() => setSelectedMatchup(null)}
      />
      <WinnerTrophyModal />
    </div>
  );
}

export default function App() {
  return (
    <TournamentProvider>
      <AppContent />
    </TournamentProvider>
  );
}
