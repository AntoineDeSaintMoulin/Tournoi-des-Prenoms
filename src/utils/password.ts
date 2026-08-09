// Transforme un mot de passe en empreinte irréversible (SHA-256) avant tout envoi à Supabase.
// Le mot de passe en clair ne quitte donc jamais le navigateur du joueur.
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
