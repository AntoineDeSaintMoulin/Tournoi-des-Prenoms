import { Bet } from '../types';

// Popularité en direct : le prénom le plus misé = 100, les autres sont proportionnels.
// Renvoie null tant qu'aucun pari n'a été placé.
export function getBetPopularity(bets: Bet[], nameId: string): number | null {
  const totals = new Map<string, number>();
  for (const b of bets) {
    if (b.status === 'cancelled') continue;
    totals.set(b.chosenNameId, (totals.get(b.chosenNameId) ?? 0) + b.pointsBet);
  }
  if (totals.size === 0) return null;
  const max = Math.max(...totals.values());
  if (max <= 0) return null;
  return Math.round(((totals.get(nameId) ?? 0) / max) * 100);
}
