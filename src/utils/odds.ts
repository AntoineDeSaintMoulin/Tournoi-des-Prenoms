/**
 * Fixed odds: every bet always pays 1.50, whatever the votes on each side.
 */
export const FIXED_ODDS = 1.5;

export function calculateOdds(_votesA: number, _votesB: number): { oddsA: number; oddsB: number } {
  return { oddsA: FIXED_ODDS, oddsB: FIXED_ODDS };
}

/**
 * Calculates potential payout for a bet amount at current odds.
 */
export function calculatePotentialPayout(betAmount: number, odds: number): number {
  return Math.round(betAmount * odds);
}

/**
 * Formats points with French spacing (e.g. 1 000 PTS)
 */
export function formatPoints(points: number): string {
  return new Intl.NumberFormat('fr-FR').format(points) + ' PTS';
}

/**
 * Formats odds string (e.g. "1,85")
 */
export function formatOdds(odds: number): string {
  return odds.toFixed(2).replace('.', ',');
}
