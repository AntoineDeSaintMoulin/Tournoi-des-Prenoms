import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables Supabase manquantes. Vérifie que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont bien définies dans ton fichier .env à la racine du projet.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
