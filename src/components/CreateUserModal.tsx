import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { hashPassword } from '../utils/password';
import { UserPlus, X, Sparkles, Lock } from 'lucide-react';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Code à changer par toi-même avant d'envoyer le lien aux joueurs.
// Seules les personnes connaissant ce code peuvent devenir "Parent".
const PARENT_SECRET_CODE = 'PRENOM2026';

const AVATAR_OPTIONS = [
  '🦁', '🐼', '🦊', '🐨', '🐸', '🐧', '🦄', '🐙', '🐢', '🦉', '🐯', '🐰',
  '🐶', '🐱', '🐭', '🐹', '🐻', '🐷', '🐮', '🐵', '🦋', '🐝', '🐳', '🐬',
  '🦈', '🦩', '🦫', '🦦', '🦥', '🐿️', '🦔', '🦖', '🐲', '🦅', '🦜', '🐴',
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose }) => {
  const { createUser } = useTournament();
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [wantsParentAccess, setWantsParentAccess] = useState<boolean>(false);
  const [secretCode, setSecretCode] = useState<string>('');
  const [codeError, setCodeError] = useState<string>('');
  const [createError, setCreateError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(AVATAR_OPTIONS[0]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreateError('');

    if (password.length < 4) {
      setCreateError('Le mot de passe doit contenir au moins 4 caractères.');
      return;
    }
    if (password !== passwordConfirm) {
      setCreateError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    let role: 'parent' | 'bettor' = 'bettor';

    if (wantsParentAccess) {
      if (secretCode !== PARENT_SECRET_CODE) {
        setCodeError('Code incorrect.');
        return;
      }
      role = 'parent';
    }

    setSubmitting(true);
    const passwordHash = await hashPassword(password);
    const result = await createUser(name.trim(), role, selectedAvatar, passwordHash);
    setSubmitting(false);

    if (!result.success) {
      setCreateError(result.message || 'Une erreur est survenue.');
      return;
    }

    setName('');
    setPassword('');
    setPasswordConfirm('');
    setSecretCode('');
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
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 4 caractères..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Confirme ton mot de passe
            </label>
            <input
              type="password"
              required
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Retape ton mot de passe..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={wantsParentAccess}
                onChange={(e) => {
                  setWantsParentAccess(e.target.checked);
                  setCodeError('');
                }}
                className="w-4 h-4 accent-amber-500"
              />
              Je suis un des organisateurs (parent)
            </label>

            {wantsParentAccess && (
              <div className="mt-3">
                <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  <Lock className="w-3 h-3" /> Code organisateur
                </label>
                <input
                  type="password"
                  value={secretCode}
                  onChange={(e) => {
                    setSecretCode(e.target.value);
                    setCodeError('');
                  }}
                  placeholder="Code secret..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
                {codeError && <p className="text-[11px] text-rose-400 mt-1.5">{codeError}</p>}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Choisir un Avatar
            </label>
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-2xl bg-slate-950 cursor-pointer border-2 transition-all ${
                    selectedAvatar === emoji ? 'border-amber-400 ring-2 ring-amber-400/40 scale-110' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {createError && (
            <div className="text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
              {createError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4" />
            {submitting ? 'Création en cours...' : 'Valider & Recevoir 1 000 Points'}
          </button>
        </form>
      </div>
    </div>
  );
};
