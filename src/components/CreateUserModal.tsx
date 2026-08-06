import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { UserPlus, X, Sparkles } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const { createUser } = useTournament();
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<'parent' | 'bettor'>('bettor');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createUser(name.trim(), role, selectedAvatar);
    setName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-slate-100 space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Créer un Profil Parieur</h3>
            <p className="text-xs text-slate-400">
              Recevez immédiatement 1 000 points offerts pour parier sur le tournoi !
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Prénom / Pseudo (ex: Mamie Chantal, Parrain Marc)
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Votre nom..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Rôle
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('bettor')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  role === 'bettor'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                🎯 Parieur / Proche
              </button>
              <button
                type="button"
                onClick={() => setRole('parent')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  role === 'parent'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                👑 Co-Organisateur
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Choisir un Avatar
            </label>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {AVATAR_OPTIONS.map((imgUrl) => (
                <img
                  key={imgUrl}
                  src={imgUrl}
                  alt="Avatar"
                  onClick={() => setSelectedAvatar(imgUrl)}
                  className={`w-12 h-12 rounded-full object-cover cursor-pointer border-2 transition-all ${
                    selectedAvatar === imgUrl ? 'border-amber-400 ring-2 ring-amber-400/40 scale-110' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" /> Valider & Recevoir 1 000 Points
          </button>
        </form>
      </div>
    </div>
  );
};
