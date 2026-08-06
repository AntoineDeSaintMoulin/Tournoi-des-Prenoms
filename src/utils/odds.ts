/**
 * Calculates parimutuel sports betting odds based on points bet.
 * Formula includes a base virtual liquidity pool (100 pts) so odds start at 2.00 vs 2.00
 * and don't explode to infinity when 0 bets are placed on one side.
 */
export function calculateOdds(votesA: number, votesB: number): { oddsA: number; oddsB: number } {
  const baseLiquidity = 150;
  const totalPool = votesA + votesB + baseLiquidity * 2;

  const poolA = votesA + baseLiquidity;
  const poolB = votesB + baseLiquidity;

  // Odds = Total Pool / Specific Pool
  // We apply a small house margin (3%) typical of sportsbooks
  const margin = 0.97;

  let oddsA = (totalPool / poolA) * margin;
  let oddsB = (totalPool / poolB) * margin;

  // Clamp minimum odds to 1.05 and round to 2 decimal places
  oddsA = Math.max(1.05, Math.round(oddsA * 100) / 100);
  oddsB = Math.max(1.05, Math.round(oddsB * 100) / 100);

  return { oddsA, oddsB };
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
