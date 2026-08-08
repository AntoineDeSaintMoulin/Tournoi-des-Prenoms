import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Sparkles, AlertCircle, CheckCircle2, GitBranch } from 'lucide-react';

interface BabyNameRow {
  id: string;
  name: string;
  gender: 'boy' | 'girl' | 'unisex';
  origin: string | null;
  meaning: string | null;
  style: string | null;
  popularity: number | null;
  syllables: number | null;
  parent_favorite: boolean;
  seed: number;
}

const emptyForm = {
  name: '',
  gender: 'boy' as 'boy' | 'girl' | 'unisex',
  origin: '',
  meaning: '',
  style: '',
  popularity: 50,
  syllables: 2,
};

export const ManageNames: React.FC = () => {
  const [names, setNames] = useState<BabyNameRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchNames = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('baby_names')
      .select('*')
      .order('seed', { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setNames(data as BabyNameRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNames();

    // Réagit en direct si un autre parent modifie la liste en même temps
    const channel = supabase
      .channel('baby_names_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'baby_names' }, () => {
        fetchNames();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddName = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('Le prénom est obligatoire.');
      return;
    }
    if (names.length >= 64) {
      setError('64 prénoms sont déjà enregistrés — supprime-en un pour en ajouter un autre.');
      return;
    }

    setSubmitting(true);

    // Attribue le prochain seed disponible (1 à 64)
    const usedSeeds = new Set(names.map((n) => n.seed));
    let nextSeed = 1;
    while (usedSeeds.has(nextSeed) && nextSeed <= 64) nextSeed++;

    const { error: insertError } = await supabase.from('baby_names').insert({
      name: form.name.trim(),
      gender: form.gender,
      origin: form.origin.trim() || null,
      meaning: form.meaning.trim() || null,
      style: form.style.trim() || null,
      popularity: form.popularity,
      syllables: form.syllables,
      seed: nextSeed,
    });

    setSubmitting(false);

    if (insertError) {
      setError(
        insertError.message.includes('duplicate')
          ? 'Ce prénom est déjà dans la liste.'
          : insertError.message
      );
      return;
    }

    setForm(emptyForm);
    fetchNames();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce prénom de la liste ?')) return;
    const { error } = await supabase.from('baby_names').delete().eq('id', id);
    if (error) {
      setError(error.message);
    } else {
      fetchNames();
    }
  };

  const remaining = 64 - names.length;
  const [generating, setGenerating] = useState(false);
  const [bracketExists, setBracketExists] = useState(false);

  useEffect(() => {
    supabase
      .from('matchups')
      .select('id', { count: 'exact', head: true })
      .then(({ count }) => setBracketExists(!!count && count > 0));
  }, [names]);

  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const handleGenerateBracket = async () => {
    if (!isPowerOfTwo(names.length)) {
      setError(
        `Le nombre de prénoms doit être une puissance de 2 (2, 4, 8, 16, 32, 64) pour générer un tableau équilibré. Actuellement : ${names.length}.`
      );
      return;
    }
    if (
      !confirm(
        `Générer le tableau à partir de ${names.length} prénoms ? Ça va créer/écraser tous les matchs existants.`
      )
    )
      return;

    setGenerating(true);
    setError(null);

    // Supprime l'ancien tableau s'il existe
    await supabase.from('matchups').delete().neq('id', -1);

    // Mélange les prénoms (tirage au sort des seeds)
    const shuffled = [...names].sort(() => Math.random() - 0.5);

    const totalMatches = shuffled.length - 1;
    const totalRounds = Math.log2(shuffled.length);
    const firstRoundMatches = shuffled.length / 2;

    const matchupsToInsert: any[] = [];

    // Premier tour : on associe les prénoms mélangés deux par deux
    for (let i = 0; i < firstRoundMatches; i++) {
      matchupsToInsert.push({
        id: i + 1,
        round: 1,
        day_number: i + 1,
        name_a_id: shuffled[i * 2].id,
        name_b_id: shuffled[i * 2 + 1].id,
        status: i === 0 ? 'live' : 'upcoming',
      });
    }

    // Tours suivants : matchs vides, remplis au fur et à mesure des résultats
    let dayCounter = firstRoundMatches + 1;
    let matchIdCounter = firstRoundMatches + 1;
    let matchesInRound = firstRoundMatches / 2;
    let round = 2;

    while (matchesInRound >= 1) {
      for (let i = 0; i < matchesInRound; i++) {
        matchupsToInsert.push({
          id: matchIdCounter,
          round,
          day_number: dayCounter,
          name_a_id: null,
          name_b_id: null,
          status: 'upcoming',
        });
        matchIdCounter++;
        dayCounter++;
      }
      matchesInRound = matchesInRound / 2;
      round++;
    }

    const { error: insertError } = await supabase.from('matchups').insert(matchupsToInsert);

    setGenerating(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setBracketExists(true);
      alert(`Tableau généré avec succès ! ${matchupsToInsert.length} matchs créés sur ${totalRounds} tours.`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header + compteur */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Gestion des 64 Prénoms candidats</h2>
              <p className="text-xs text-slate-400">Ajoute les prénoms un par un jusqu'à 64.</p>
            </div>
          </div>

          <div
            className={`px-4 py-2 rounded-xl font-mono font-bold text-sm border ${
              names.length === 64
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-amber-400'
            }`}
          >
            {names.length} / 64
          </div>
        </div>

        {names.length === 64 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Les 64 prénoms sont complets !
          </div>
        )}

        {isPowerOfTwo(names.length) && names.length >= 2 && (
          <button
            onClick={handleGenerateBracket}
            disabled={generating}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 border border-amber-500/30 text-amber-300 font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <GitBranch className="w-4 h-4" />
            {generating
              ? 'Génération en cours...'
              : bracketExists
              ? `Régénérer le tableau (${names.length} prénoms)`
              : `Générer le tableau du tournoi (${names.length} prénoms)`}
          </button>
        )}
      </div>

      {/* Formulaire d'ajout */}
      {remaining > 0 && (
        <form
          onSubmit={handleAddName}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4"
        >
          <h3 className="text-sm font-bold text-white">Ajouter un prénom ({remaining} restants)</h3>

          {error && (
            <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Prénom *"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
            />

            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
            >
              <option value="boy">Garçon</option>
              <option value="girl">Fille</option>
              <option value="unisex">Mixte</option>
            </select>

            <input
              type="text"
              placeholder="Origine (ex: Latin, Grec...)"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Style (ex: Classique, Moderne...)"
              value={form.style}
              onChange={(e) => setForm({ ...form, style: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
            />

            <input
              type="text"
              placeholder="Signification"
              value={form.meaning}
              onChange={(e) => setForm({ ...form, meaning: e.target.value })}
              className="sm:col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:border-amber-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-slate-950 font-black text-sm py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {submitting ? 'Ajout en cours...' : 'Ajouter ce prénom'}
          </button>
        </form>
      )}

      {/* Liste des prénoms déjà ajoutés */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white mb-4">Prénoms enregistrés</h3>

        {loading ? (
          <p className="text-xs text-slate-500">Chargement...</p>
        ) : names.length === 0 ? (
          <p className="text-xs text-slate-500">Aucun prénom ajouté pour l'instant.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {names.map((n) => (
              <div
                key={n.id}
                className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5"
              >
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
                    #{n.seed}
                  </span>
                  <span className="font-bold text-white">{n.name}</span>
                  <span className="text-[10px] text-slate-500">
                    {n.gender === 'boy' ? 'Garçon' : n.gender === 'girl' ? 'Fille' : 'Mixte'}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(n.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
