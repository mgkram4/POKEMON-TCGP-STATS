import { DeckStats } from '../types/stats';

// Calculate deck statistics from CSV data
export const calculateDeckStats = (csvData: string): DeckStats[] => {
  const rows = csvData.split('\n').slice(1); // Skip header
  const deckMap = new Map<string, {
    games: number;
    wins: number;
    losses: number;
    ties: number;
    favorableMatchups: Set<string>;
  }>();

  // Process each row
  rows.forEach(row => {
    const [deck1, deck2, wins, losses, ties, total, winRate] = row.split(',');
    if (!deck1 || !deck2 || !total || !winRate) return;

    // Initialize deck stats if not exists
    for (const deck of [deck1, deck2]) {
      if (!deckMap.has(deck)) {
        deckMap.set(deck, {
          games: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          favorableMatchups: new Set()
        });
      }
    }

    const totalGames = parseInt(total);
    const deck1Stats = deckMap.get(deck1)!;
    deck1Stats.games += totalGames;
    deck1Stats.wins += parseInt(wins);
    deck1Stats.losses += parseInt(losses);
    deck1Stats.ties += parseInt(ties || '0');

    if (parseFloat(winRate) > 50) {
      deck1Stats.favorableMatchups.add(deck2);
    }

    // Update deck2 stats (mirror matches counted only once)
    if (deck1 !== deck2) {
      const deck2Stats = deckMap.get(deck2)!;
      deck2Stats.games += totalGames;
      deck2Stats.wins += parseInt(losses);
      deck2Stats.losses += parseInt(wins);
      deck2Stats.ties += parseInt(ties || '0');
    }
  });

  // Calculate total games for meta share
  const totalGames = Array.from(deckMap.values()).reduce((acc, curr) => acc + curr.games, 0);

  // Convert to final stats format
  return Array.from(deckMap.entries())
    .map(([name, stats]) => ({
      name,
      totalGames: stats.games,
      winRate: (stats.wins / (stats.wins + stats.losses)) * 100,
      metaShare: (stats.games / totalGames) * 100,
      favorableMatchups: stats.favorableMatchups.size,
      performanceScore: (stats.wins / (stats.wins + stats.losses)) * 70 + (stats.games / totalGames) * 30
    }))
    .sort((a, b) => b.performanceScore - a.performanceScore);
};

// Calculate performance score
 