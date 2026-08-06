import { BabyName, Matchup } from '../types';

/**
 * Generates the initial 63 matchups for 64 seeded names.
 * Days 1-32: Round 1 (32 matches)
 * Days 33-48: Round 2 (16 matches)
 * Days 49-56: Round 3 / R16 (8 matches)
 * Days 57-60: Round 4 / Quarterfinals (4 matches)
 * Days 61-62: Round 5 / Semifinals (2 matches)
 * Day 63: Round 6 / Grande Finale (1 match)
 */
export function createInitialMatchups(names: BabyName[]): Matchup[] {
  const sortedNames = [...names].sort((a, b) => a.seed - b.seed);
  const matchups: Matchup[] = [];

  // Standard tournament seeding pairings for 32 first round matches
  // Seed pairs for 64-team bracket: (1, 64), (32, 33), (16, 49), (17, 48), (8, 57), (25, 40), (9, 56), (24, 41)...
  const pairedIndexes: [number, number][] = [];
  
  // We construct classic balanced bracket seeding
  const seeds1to32 = Array.from({ length: 32 }, (_, i) => i + 1);
  for (let i = 0; i < 32; i++) {
    const seedA = seeds1to32[i];
    const seedB = 65 - seedA;
    pairedIndexes.push([seedA - 1, seedB - 1]);
  }

  // Round 1 (Matches 1 to 32)
  for (let i = 0; i < 32; i++) {
    const [idxA, idxB] = pairedIndexes[i];
    matchups.push({
      id: i + 1,
      round: 1,
      dayNumber: i + 1,
      nameA: sortedNames[idxA] || null,
      nameB: sortedNames[idxB] || null,
      votesA: 0,
      votesB: 0,
      countA: 0,
      countB: 0,
      winnerId: null,
      status: i === 0 ? 'live' : 'upcoming',
    });
  }

  // Round 2 (Matches 33 to 48)
  for (let i = 0; i < 16; i++) {
    matchups.push({
      id: 32 + i + 1,
      round: 2,
      dayNumber: 32 + i + 1,
      nameA: null,
      nameB: null,
      votesA: 0,
      votesB: 0,
      countA: 0,
      countB: 0,
      winnerId: null,
      status: 'upcoming',
    });
  }

  // Round 3 - 8èmes de finale (Matches 49 to 56)
  for (let i = 0; i < 8; i++) {
    matchups.push({
      id: 48 + i + 1,
      round: 3,
      dayNumber: 48 + i + 1,
      nameA: null,
      nameB: null,
      votesA: 0,
      votesB: 0,
      countA: 0,
      countB: 0,
      winnerId: null,
      status: 'upcoming',
    });
  }

  // Round 4 - Quarts de finale (Matches 57 to 60)
  for (let i = 0; i < 4; i++) {
    matchups.push({
      id: 56 + i + 1,
      round: 4,
      dayNumber: 56 + i + 1,
      nameA: null,
      nameB: null,
      votesA: 0,
      votesB: 0,
      countA: 0,
      countB: 0,
      winnerId: null,
      status: 'upcoming',
    });
  }

  // Round 5 - Demi-finales (Matches 61 to 62)
  for (let i = 0; i < 2; i++) {
    matchups.push({
      id: 60 + i + 1,
      round: 5,
      dayNumber: 60 + i + 1,
      nameA: null,
      nameB: null,
      votesA: 0,
      votesB: 0,
      countA: 0,
      countB: 0,
      winnerId: null,
      status: 'upcoming',
    });
  }

  // Round 6 - Grande Finale (Match 63)
  matchups.push({
    id: 63,
    round: 6,
    dayNumber: 63,
    nameA: null,
    nameB: null,
    votesA: 0,
    votesB: 0,
    countA: 0,
    countB: 0,
    winnerId: null,
    status: 'upcoming',
  });

  return matchups;
}

/**
 * Calculates the next matchup ID and slot ('A' or 'B') for the winner of a matchup.
 */
export function getNextMatchupLocation(currentMatchupId: number): { nextMatchupId: number; slot: 'A' | 'B' } | null {
  if (currentMatchupId >= 63) return null; // Final match has no next location

  if (currentMatchupId <= 32) {
    // Round 1 -> Round 2 (Matches 33..48)
    const relativeIndex = currentMatchupId; // 1..32
    const nextMatchupId = 32 + Math.ceil(relativeIndex / 2);
    const slot = relativeIndex % 2 === 1 ? 'A' : 'B';
    return { nextMatchupId, slot };
  } else if (currentMatchupId <= 48) {
    // Round 2 -> Round 3 (Matches 49..56)
    const relativeIndex = currentMatchupId - 32; // 1..16
    const nextMatchupId = 48 + Math.ceil(relativeIndex / 2);
    const slot = relativeIndex % 2 === 1 ? 'A' : 'B';
    return { nextMatchupId, slot };
  } else if (currentMatchupId <= 56) {
    // Round 3 -> Round 4 (Matches 57..60)
    const relativeIndex = currentMatchupId - 48; // 1..8
    const nextMatchupId = 56 + Math.ceil(relativeIndex / 2);
    const slot = relativeIndex % 2 === 1 ? 'A' : 'B';
    return { nextMatchupId, slot };
  } else if (currentMatchupId <= 60) {
    // Round 4 -> Round 5 (Matches 61..62)
    const relativeIndex = currentMatchupId - 56; // 1..4
    const nextMatchupId = 60 + Math.ceil(relativeIndex / 2);
    const slot = relativeIndex % 2 === 1 ? 'A' : 'B';
    return { nextMatchupId, slot };
  } else if (currentMatchupId <= 62) {
    // Round 5 -> Round 6 (Match 63)
    const relativeIndex = currentMatchupId - 60; // 1..2
    const nextMatchupId = 63;
    const slot = relativeIndex % 2 === 1 ? 'A' : 'B';
    return { nextMatchupId, slot };
  }

  return null;
}

export function getRoundName(roundNumber: number): string {
  switch (roundNumber) {
    case 1:
      return '1er Tour (64 Prénoms)';
    case 2:
      return '2e Tour (32 Prénoms)';
    case 3:
      return '8èmes de Finale';
    case 4:
      return 'Quarts de Finale';
    case 5:
      return 'Demi-Finales';
    case 6:
      return 'GRANDE FINALE';
    default:
      return `Tour ${roundNumber}`;
  }
}
