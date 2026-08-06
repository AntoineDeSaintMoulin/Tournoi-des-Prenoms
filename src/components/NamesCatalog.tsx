import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { BabyName, Gender } from '../types';
import { Sparkles, Search, Volume2, Heart, Trophy, Filter, CheckCircle2, XCircle } from 'lucide-react';

export const NamesCatalog: React.FC = () => {
  const { names, matchups, toggleParentFavorite } = useTournament();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Audio pronounce function
  const speakName = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Determine status of each name in tournament
  const getNameStatus = (nameId: string): 'champion' | 'in_running' | 'eliminated' => {
    const finalMatch = matchups.find((m) => m.id === 63);
    if (finalMatch?.winnerId === nameId) return 'champion';

    // Check if name has lost any completed match
    const lostMatch = matchups.find((m) => m.status === 'completed' && (m.nameA?.id === nameId || m.nameB?.id === nameId) && m.winnerId !== nameId);
    if (lostMatch) return 'eliminated';

    return 'in_running';
  };

  const filteredNames = names.filter((n) => {
    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = n.name.toLowerCase().includes(q) || n.origin.toLowerCase().includes(q) || n.meaning.toLowerCase().includes(q) || n.style.toLowerCase().includes(q);
      if (!matchName) return false;
    }

    // Gender filter
    if (selectedGender !== 'all' && n.gender !== selectedGender) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all') {
      const status = getNameStatus(n.id);
      if (selectedStatus === 'in_running' && status !== 'in_running') return false;
      if (selectedStatus === 'eliminated' && status !== 'eliminated') return false;
      if (selectedStatus === 'champion' && status !== 'champion') return false;
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Title Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Catalogue des 64 Prénoms candidats</h2>
            <p className="text-xs text-slate-400">
              Découvrez la signification, l'origine, la popularité et le statut dans le tournoi.
            </p>
          </div>
        </div>

        {/* Controls & Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par prénom, origine, mot-clé..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          {/* Gender Filter */}
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none font-medium"
          >
            <option value="all">Tous les genres (Garçon, Fille, Mixte)</option>
            <option value="boy">Garçon</option>
            <option value="girl">Fille</option>
            <option value="unisex">Mixte</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:border-amber-400 focus:outline-none font-medium"
          >
            <option value="all">Tous les statuts</option>
            <option value="in_running">En lice (Qualifiés)</option>
            <option value="eliminated">Éliminés</option>
            <option value="champion">Grand Vainqueur</option>
          </select>
        </div>
      </div>

      {/* Grid of Names Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredNames.map((item) => {
          const status = getNameStatus(item.id);

          return (
            <div
              key={item.id}
              className={`bg-slate-900 border rounded-2xl p-5 shadow-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                status === 'champion'
                  ? 'border-amber-400 bg-amber-500/10'
                  : status === 'eliminated'
                  ? 'border-slate-800/60 opacity-60'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    Seed #{item.seed}
                  </span>

                  <div className="flex items-center gap-2">
                    {status === 'champion' ? (
                      <span className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Trophy className="w-3 h-3 fill-slate-950" /> Champion
                      </span>
                    ) : status === 'eliminated' ? (
                      <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-slate-500" /> Éliminé
                      </span>
                    ) : (
                      <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> En lice
                      </span>
                    )}

                    <button
                      onClick={() => toggleParentFavorite(item.id)}
                      className={`p-1.5 rounded-full border transition-all ${
                        item.parentFavorite
                          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-rose-400'
                      }`}
                      title="Favori des parents"
                    >
                      <Heart className={`w-3.5 h-3.5 ${item.parentFavorite ? 'fill-rose-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Name title & Audio button */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-black text-white">{item.name}</h3>
                  <button
                    onClick={() => speakName(item.name)}
                    className="p-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 rounded-lg transition-all"
                    title="Prononcer le prénom"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3 text-[11px] font-medium">
                  <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700/60">
                    {item.origin}
                  </span>
                  <span className="bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                    {item.style}
                  </span>
                  <span className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
                    Pop. {item.popularity}/100
                  </span>
                </div>

                <p className="text-xs text-slate-400 italic leading-relaxed">
                  « {item.meaning} »
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
