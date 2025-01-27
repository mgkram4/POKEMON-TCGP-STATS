"use client"

import { ApiResponse } from '@/app/api/meta-data/route';
import DeckPerformance from '@/app/components/DeckPerformance';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBolt, FaBrain, FaFire, FaWater } from 'react-icons/fa';

interface DeckStats {
  deck: string;
  winRate: string;
  metaShare: string;
  totalGames: number;
  favorableMatchups: number;
  performanceScore: string;
}

interface PokemonData {
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
}

interface MatchupData {
  opponent: string;
  winRate: number;
  games: number;
}

interface DeckInsights {
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

type TierType = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

const typeColors = {
  psychic: 'from-purple-500 to-purple-700',
  water: 'from-blue-500 to-blue-700',
  electric: 'from-yellow-400 to-yellow-600',
  fire: 'from-orange-500 to-orange-700',
  grass: 'from-green-500 to-green-700',
  normal: 'from-gray-500 to-gray-700',
};

const typeIcons = {
  psychic: FaBrain,
  water: FaWater,
  electric: FaBolt,
  fire: FaFire,
};

const MatchupCard = ({ title, matchups }: { title: string; matchups: MatchupData[] }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <div className="space-y-3">
      {matchups.map((matchup, index) => (
        <div key={index} className="flex justify-between items-center">
          <span className="font-medium">{matchup.opponent}</span>
          <div className="flex items-center gap-2">
            <span className={`font-bold ${matchup.winRate >= 50 ? 'text-green-600' : 'text-red-600'}`}>
              {matchup.winRate.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500">({matchup.games} games)</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) => (
  <div className="bg-white rounded-xl p-6 shadow-lg">
    <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
    <div className="mt-2">
      <span className="text-3xl font-bold">{value}</span>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  </div>
);

const DeckPage = () => {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  const [insights, setInsights] = useState<DeckInsights | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/meta-data');
        const data: ApiResponse = await response.json();
        
        if ('error' in data) {
          throw new Error(data.error as string);
        }

        // Find the deck in deckDetails instead of searching through tiers
        const normalizedSlug = String(slug).toLowerCase();
        const deckName = Object.keys(data.deckDetails).find(name => 
          name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === normalizedSlug
        );

        if (!deckName) {
          throw new Error('Deck not found');
        }

        const foundDeck = data.deckDetails[deckName];
        const deckInsights = data.insights[deckName];

        if (!foundDeck || !deckInsights) {
          throw new Error('Deck data not found');
        }

        setDeckStats(foundDeck);
        setInsights(deckInsights);

        // Fetch Pokemon data using the first word of the deck name
        const pokemonName = deckName.split(/[\s-]/)[0].toLowerCase();
        const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const pokemonData = await pokemonResponse.json();
        setPokemonData(pokemonData);

      } catch (error) {
        console.error('Error fetching data:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!deckStats) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold">Deck not found</h1>
        </div>
      </div>
    );
  }

  const mainType = pokemonData?.types[0]?.type.name || 'normal';
  const TypeIcon = typeIcons[mainType as keyof typeof typeIcons] || FaBrain;

  return (
    <div className={`min-h-screen p-6 bg-gradient-to-br from-${mainType}-50 to-${mainType}-100`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${typeColors[mainType as keyof typeof typeColors]} p-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TypeIcon className="text-3xl" />
                <h1 className="text-4xl font-bold">{deckStats.deck}</h1>
              </div>
              <div className="max-w-2xl text-lg opacity-90">
                <p>Performance Score: {deckStats.performanceScore}</p>
              </div>
            </div>
            {pokemonData && (
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                src={pokemonData.sprites.other['official-artwork'].front_default}
                alt={deckStats.deck}
                className="w-64 h-64 object-contain"
              />
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DeckPerformance
              winRate={deckStats.winRate}
              metaShare={deckStats.metaShare}
              totalGames={deckStats.totalGames}
              favorableMatchups={deckStats.favorableMatchups}
            />
          </motion.div>

          {insights && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  title="Meta Position"
                  value={`#${insights.metaPosition}`}
                  subtitle={`Out of ${insights.totalDecks} decks`}
                />
                <StatCard
                  title="Tier"
                  value={insights.tier}
                  subtitle={`Top ${insights.performance.percentile}%`}
                />
              </div>
            </motion.div>
          )}

          {insights && insights.bestMatchups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <MatchupCard title="Best Matchups" matchups={insights.bestMatchups} />
            </motion.div>
          )}

          {insights && insights.worstMatchups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <MatchupCard title="Worst Matchups" matchups={insights.worstMatchups} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DeckPage;