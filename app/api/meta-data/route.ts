import { DeckStats } from '@/app/types/stats';
import fs from 'fs';
import { NextResponse } from 'next/server';
import { parse } from 'papaparse';
import path from 'path';

// Type Definitions
import { IconType } from 'react-icons';

export interface TypeIcon {
  icon: IconType;
  color: string;
}

export interface PokemonImage {
  name: string;
  imageUrl: string;
}

export interface TierCardProps {
  deck: string;
  stats: DeckStats;
  tier: TierType;
}

export interface TierListProps {
  tier: TierType;
  decks: DeckStats[];
}

export interface CustomCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export interface CSVRow {
  deck1: string;
  deck2: string;
  wins: number;
  losses: number;
  ties: number;
  total: number;
  win_rate: number;
}

export interface DeckStatsMap {
  totalGames: number;
  wins: number;
  losses: number;
  ties: number;
  favorableMatchups: number;
}

export interface ProcessedDeckStats {
  deck: string;
  winRate: string;
  metaShare: string;
  totalGames: number;
  favorableMatchups: number;
  performanceScore: string;
}

export interface TierData {
  S: ProcessedDeckStats[];
  A: ProcessedDeckStats[];
  B: ProcessedDeckStats[];
  C: ProcessedDeckStats[];
  D: ProcessedDeckStats[];
  F: ProcessedDeckStats[];
}

export interface MatchupData {
  opponent: string;
  winRate: number;
  games: number;
}

export interface DeckInsights {
  bestMatchups: MatchupData[];
  worstMatchups: MatchupData[];
  metaPosition: number;
  totalDecks: number;
  tier: TierType;
  popularity: {
    rank: number;
    percentile: string;
  };
  performance: {
    rank: number;
    percentile: string;
  };
}

export interface ApiResponse {
  tiers: TierData;
  deckDetails: Record<string, ProcessedDeckStats>;
  matchups: Record<string, MatchupData[]>;
  insights: Record<string, DeckInsights>;
}

export type TierType = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

export async function GET(): Promise<NextResponse<ApiResponse | { error: string }>> {
  try {
    // Read the CSV file
    const filePath = path.join(process.cwd(), 'trainerhill-meta-matchups-2025-01-27.csv');
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Parse CSV
    const { data } = parse<CSVRow>(fileContent, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true
    });

    // Calculate deck statistics
    const deckStats = new Map<string, DeckStatsMap>();

    // Process each row
    data.forEach((row: CSVRow) => {
      // Process deck1
      if (!deckStats.has(row.deck1)) {
        deckStats.set(row.deck1, {
          totalGames: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          favorableMatchups: 0
        });
      }
      const stats1 = deckStats.get(row.deck1)!;
      stats1.totalGames += row.total;
      stats1.wins += row.wins;
      stats1.losses += row.losses;
      stats1.ties += row.ties;
      if (row.win_rate > 50) {
        stats1.favorableMatchups++;
      }

      // Process deck2
      if (!deckStats.has(row.deck2)) {
        deckStats.set(row.deck2, {
          totalGames: 0,
          wins: 0,
          losses: 0,
          ties: 0,
          favorableMatchups: 0
        });
      }
      const stats2 = deckStats.get(row.deck2)!;
      stats2.totalGames += row.total;
      stats2.wins += row.losses; // Note: wins/losses are swapped for deck2
      stats2.losses += row.wins;
      stats2.ties += row.ties;
      if (row.win_rate < 50) {
        stats2.favorableMatchups++;
      }
    });

    // Calculate total games for meta share calculation
    const totalGames = Array.from(deckStats.values())
      .reduce((sum, stats) => sum + stats.totalGames, 0) / 2;

    // Process stats and assign tiers
    const processedStats: ProcessedDeckStats[] = Array.from(deckStats.entries()).map(([deck, stats]) => {
      const winRate = (stats.wins / (stats.totalGames - stats.ties)) * 100;
      const metaShare = (stats.totalGames / totalGames) * 100;
      const performanceScore = winRate * 0.4 + metaShare * 0.4 + stats.favorableMatchups * 2;

      return {
        deck,
        winRate: winRate.toFixed(1),
        metaShare: metaShare.toFixed(1),
        totalGames: stats.totalGames,
        favorableMatchups: stats.favorableMatchups,
        performanceScore: performanceScore.toFixed(1)
      };
    });

    // Sort by performance score
    const sortedStats = processedStats.sort((a, b) => 
      parseFloat(b.performanceScore) - parseFloat(a.performanceScore)
    );

    // Assign tiers
    const tierData: TierData = {
      S: [],
      A: [],
      B: [],
      C: [],
      D: [],
      F: []
    };

    sortedStats.forEach((deck, index) => {
      const percentile = (index / sortedStats.length) * 100;
      if (percentile <= 10) tierData.S.push(deck);
      else if (percentile <= 25) tierData.A.push(deck);
      else if (percentile <= 50) tierData.B.push(deck);
      else if (percentile <= 75) tierData.C.push(deck);
      else if (percentile <= 90) tierData.D.push(deck);
      else tierData.F.push(deck);
    });

    // Create deckDetails
    const deckDetails: Record<string, ProcessedDeckStats> = Object.fromEntries(
      processedStats.map(stats => [stats.deck, stats])
    );

    // Create matchups data
    const matchups: Record<string, MatchupData[]> = {};
    data.forEach((row: CSVRow) => {
      if (!matchups[row.deck1]) matchups[row.deck1] = [];
      matchups[row.deck1].push({
        opponent: row.deck2,
        winRate: row.win_rate,
        games: row.total
      });
    });

    // Generate insights for each deck
    const insights: Record<string, DeckInsights> = {};
    sortedStats.forEach((deck, index) => {
      const deckMatchups = matchups[deck.deck] || [];
      const sortedMatchups = [...deckMatchups].sort((a, b) => b.winRate - a.winRate);
      
      const tier = index <= sortedStats.length * 0.1 ? 'S' :
                   index <= sortedStats.length * 0.25 ? 'A' :
                   index <= sortedStats.length * 0.5 ? 'B' :
                   index <= sortedStats.length * 0.75 ? 'C' :
                   index <= sortedStats.length * 0.9 ? 'D' : 'F';

      insights[deck.deck] = {
        bestMatchups: sortedMatchups.slice(0, 5),
        worstMatchups: sortedMatchups.slice(-5).reverse(),
        metaPosition: index + 1,
        totalDecks: sortedStats.length,
        tier,
        popularity: {
          rank: sortedStats.sort((a, b) => parseFloat(b.metaShare) - parseFloat(a.metaShare))
                           .findIndex(d => d.deck === deck.deck) + 1,
          percentile: ((index / sortedStats.length) * 100).toFixed(1)
        },
        performance: {
          rank: index + 1,
          percentile: ((index / sortedStats.length) * 100).toFixed(1)
        }
      };
    });

    return NextResponse.json({
      tiers: tierData,
      deckDetails,
      matchups,
      insights
    });

  } catch (error) {
    console.error('Error processing meta data:', error);
    return NextResponse.json(
      { error: 'Failed to process meta data' },
      { status: 500 }
    );
  }
}