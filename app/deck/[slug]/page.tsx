"use client"

import { ApiResponse } from '@/app/api/meta-data/route';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBolt, FaChartBar, FaChartLine, FaStar, FaTrophy } from 'react-icons/fa';

// Type-based color system
const typeColors = {
  normal: {
    from: '#A8A878',
    to: '#6D6D4E',
  },
  fire: {
    from: '#E3350D',
    to: '#B32D0B',
  },
  water: {
    from: '#0055B7',
    to: '#003C80',
  },
  electric: {
    from: '#FDD23C',
    to: '#D5B032',
  },
  grass: {
    from: '#00A058',
    to: '#007040',
  },
  ice: {
    from: '#66CCFF',
    to: '#3399CC',
  },
  fighting: {
    from: '#BB5544',
    to: '#802F1F',
  },
  poison: {
    from: '#AA5599',
    to: '#6C3366',
  },
  ground: {
    from: '#DDBB55',
    to: '#AD8D33',
  },
  flying: {
    from: '#8899FF',
    to: '#6F7FCC',
  },
  psychic: {
    from: '#A65D9E',
    to: '#783C73',
  },
  bug: {
    from: '#AABB22',
    to: '#848F19',
  },
  rock: {
    from: '#BBAA66',
    to: '#8E7F4D',
  },
  ghost: {
    from: '#6666BB',
    to: '#4A4A8C',
  },
  dragon: {
    from: '#7766EE',
    to: '#5B4DBB',
  },
  dark: {
    from: '#775544',
    to: '#513A2F',
  },
  steel: {
    from: '#AAAABB',
    to: '#7A7A8C',
  },
  fairy: {
    from: '#EE99EE',
    to: '#BF7ABF',
  }
};


// Interfaces
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

// Components
const MatchupCard = ({ title, matchups }: { title: string; matchups: MatchupData[] }) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <FaChartLine className={`text-lg ${title.includes('Best') ? 'text-green-500' : 'text-red-500'}`} />
      {title}
    </h3>
    <div className="space-y-4">
      {matchups.map((matchup, index) => (
        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <span className="font-medium text-gray-700">{matchup.opponent}</span>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full ${
              matchup.winRate >= 50 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <span className="font-bold">{matchup.winRate.toFixed(1)}%</span>
            </div>
            <span className="text-sm text-gray-500">
              {matchup.games.toLocaleString()} games
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatCard = ({ title, value, subtitle, icon: Icon }: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType;
}) => (
  <div className="bg-white rounded-xl p-6 border border-gray-200">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      <Icon className="text-2xl text-blue-500" />
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

  // Add scroll to top effect
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/meta-data');
        const data: ApiResponse = await response.json();
        
        if ('error' in data) {
          throw new Error(data.error as string);
        }

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!deckStats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Deck not found</h1>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const mainType = pokemonData?.types[0]?.type.name || 'normal';
  const typeColor = typeColors[mainType as keyof typeof typeColors] || typeColors.normal;

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative overflow-hidden rounded-xl border border-gray-200"
          style={{
            background: `linear-gradient(135deg, ${typeColor.from}, ${typeColor.to})`
          }}
        >
          {/* Pattern Overlay */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFFFFF' fill-opacity='0.2' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative z-10 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <FaTrophy className="text-3xl" />
                  </div>
                  <h1 className="text-4xl font-bold">{deckStats.deck}</h1>
                </div>
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                      Performance Score: {deckStats.performanceScore}
                    </span>
                    {insights && (
                      <span className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm">
                        Tier {insights.tier}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {pokemonData && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  src={pokemonData.sprites.other['official-artwork'].front_default}
                  alt={deckStats.deck}
                  className="w-64 h-64 object-contain filter drop-shadow-lg"
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatCard
              title="Win Rate"
              value={`${deckStats.winRate}%`}
              icon={FaChartLine}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatCard
              title="Meta Share"
              value={`${deckStats.metaShare}%`}
              icon={FaChartBar}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <StatCard
              title="Total Games"
              value={deckStats.totalGames.toLocaleString()}
              icon={FaBolt}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <StatCard
              title="Meta Position"
              value={insights ? `#${insights.metaPosition}` : '-'}
              subtitle={insights ? `Out of ${insights.totalDecks} decks` : undefined}
              icon={FaStar}
            />
          </motion.div>
        </div>

        {/* Matchups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insights && insights.bestMatchups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <MatchupCard title="Best Matchups" matchups={insights.bestMatchups} />
            </motion.div>
          )}

          {insights && insights.worstMatchups.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <MatchupCard title="Worst Matchups" matchups={insights.worstMatchups} />
            </motion.div>
          )}
        </div>
  

          {insights && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white rounded-xl p-6 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">Popularity Ranking</h4>
                  <p className="text-2xl font-bold text-gray-900">#{insights.popularity.rank}</p>
                  <p className="text-sm text-gray-500">Top {insights.popularity.percentile}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">Performance Ranking</h4>
                  <p className="text-2xl font-bold text-gray-900">#{insights.performance.rank}</p>
                  <p className="text-sm text-gray-500">Top {insights.performance.percentile}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm text-gray-600 mb-1">Favorable Matchups</h4>
                  <p className="text-2xl font-bold text-gray-900">{deckStats.favorableMatchups}</p>
                  <p className="text-sm text-gray-500">Against Meta Decks</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
  
        {/* World Championships Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-gray-600">
                  © 2025 Pokemon TCG World Championships
                </p>
                <p className="text-sm text-gray-500">
                  All Pokemon-related content belongs to Nintendo & The Pokemon Company
                </p>
              </div>
              
              {/* Return to Dashboard Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg 
                           hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
              >
                Return to Dashboard
              </motion.button>
            </div>
          </div>
        </footer>
      </div>
    );
  };
  
  export default DeckPage;