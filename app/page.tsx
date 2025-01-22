"use client"

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaBolt, FaBrain, FaCrown, FaFire, FaFish, FaLeaf, FaWater } from 'react-icons/fa';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CustomCard } from './components/card';
import GoogleAd from './components/GoogleAd';

// Pokémon TCG Theme Colors
type TierType = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

const colors: Record<TierType, string> = {
  S: '#2E7D32', // Dark Green
  A: '#4CAF50', // Green
  B: '#8BC34A', // Light Green
  C: '#FDD835', // Yellow
  D: '#FF9800', // Orange
  F: '#F44336'  // Red
};

const typeColors = {

  psychic: '#9C27B0',
  water: '#2196F3',
  grass: '#4CAF50',
  electric: '#FDD835',
  fire: '#FF9800',
  fighting: '#795548',
  normal: '#9E9E9E'
};

const typeIcons: Record<string, TypeIcon> = {
  'mewtwo-ex': { icon: FaBrain, color: typeColors.psychic },
  'gyarados-ex': { icon: FaWater, color: typeColors.water },
  'exeggutor-ex': { icon: FaLeaf, color: typeColors.grass },
  'pikachu-ex': { icon: FaBolt, color: typeColors.electric },
  'charizard-ex': { icon: FaFire, color: typeColors.fire },
  'aerodactyl-ex': { icon: FaFish, color: typeColors.fighting }
};

// Add interfaces for the data structures
interface DeckStats {
  deck: string;
  winRate: string;
  metaShare: string;
  totalGames: number;
  favorableMatchups: number;
  performanceScore: string;
}

interface TypeIcon {
  icon: React.ElementType;
  color: string;
}

interface PokemonImage {
  name: string;
  imageUrl: string;
}

interface TierCardProps {
  deck: string;
  stats: DeckStats;
  tier: TierType;
}

interface TierListProps {
  tier: TierType;
  decks: DeckStats[];
}

// Simplified color mappings using Tailwind classes
const getTierColorClass = (tier: TierType): string => ({
  'S': 'text-tier-s',
  'A': 'text-tier-a',
  'B': 'text-tier-b',
  'C': 'text-tier-c',
  'D': 'text-tier-d',
  'F': 'text-tier-f'
}[tier]);

const getPokemonNameForApi = (deckName: string): string => {
  // Convert to lowercase and remove special characters
  const normalized = deckName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
  // Special case mappings
  const specialCases: Record<string, string> = {
    'charizardexarcanine': 'charizard',
    'charizardexmoltres': 'charizard',
    'arcanineex': 'arcanine',
    'serperiorexeggutor': 'serperior',
    'golemdruddigon': 'golem',
    'scolipede': 'scolipede',
    'greninja': 'greninja',
    'celebiex': 'celebi',
    'mewtwoex': 'mewtwo',
    'gyaradosex': 'gyarados',
    'exeggutorex': 'exeggutor',
    'pikachuex': 'pikachu',
    'aerodactylex': 'aerodactyl'
  };

  // Find the matching key in specialCases
  const matchingKey = Object.keys(specialCases).find(key => 
    normalized.includes(key)
  );

  return matchingKey ? specialCases[matchingKey] : normalized.split('-')[0];
};

const getPokemonImage = async (pokemonName: string): Promise<PokemonImage | null> => {
  try {
    const apiName = getPokemonNameForApi(pokemonName);
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
    const data = await response.json();
    return {
      name: pokemonName,
      imageUrl: data.sprites.other['official-artwork'].front_default || data.sprites.front_default
    };
  } catch (error) {
    console.error(`Error fetching Pokemon image for ${pokemonName}:`, error);
    return null;
  }
};

const TierCard = ({ deck, stats, tier }: TierCardProps) => {
  const [pokemonImage, setPokemonImage] = useState<PokemonImage | null>(null);

  useEffect(() => {
    const loadPokemonImage = async () => {
      const image = await getPokemonImage(deck);
      setPokemonImage(image);
    };
    loadPokemonImage();
  }, [deck]);

  const getDeckIcon = () => {
    const deckBase = Object.keys(typeIcons).find(key => deck.toLowerCase().includes(key));
    const iconData = deckBase ? typeIcons[deckBase] : { icon: FaCrown, color: typeColors.normal };
    const Icon = iconData.icon;
    return <Icon className={`text-xl text-pokemon-${iconData.color.split('.').pop()}`} />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {pokemonImage ? (
              <img 
                src={pokemonImage.imageUrl} 
                alt={pokemonImage.name}
                className="w-12 h-12 object-contain"
              />
            ) : (
              getDeckIcon()
            )}
            {deck}
          </div>
          <div className={`px-2 py-1 rounded text-xs font-bold ${getTierColorClass(tier)}`}>
            Tier {tier}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Win Rate', value: `${stats.winRate}%` },
            { label: 'Meta Share', value: `${stats.metaShare}%` },
            { label: 'Games Played', value: stats.totalGames.toLocaleString() },
            { label: 'Favorable Matchups', value: stats.favorableMatchups }
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const TierList = ({ tier, decks }: TierListProps) => {
  return (
    <motion.div
      key={tier}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className={`text-2xl font-bold ${getTierColorClass(tier)}`}>
        Tier {tier}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {decks.map((deck) => (
          <TierCard
            key={deck.deck}
            deck={deck.deck}
            stats={deck}
            tier={tier}
          />
        ))}
      </div>
    </motion.div>
  );
};

const PokemonTierDashboard = () => {
  const tierData: Record<TierType, DeckStats[]> = {
    "S": [{
      deck: "Mewtwo-EX",
      winRate: "47.8",
      metaShare: "52.4",
      totalGames: 40698,
      favorableMatchups: 7,
      performanceScore: "58.8"
    }],
    "A": [
      {
        deck: "Gyarados-EX",
        winRate: "48.6",
        metaShare: "37.8",
        totalGames: 29388,
        favorableMatchups: 7,
        performanceScore: "54.8"
      },
      {
        deck: "Exeggutor-EX",
        winRate: "48.8",
        metaShare: "16.6",
        totalGames: 12924,
        favorableMatchups: 8,
        performanceScore: "50.5"
      }
    ],
    "B": [
      {
        deck: "Pikachu-EX",
        winRate: "48.1",
        metaShare: "27.3",
        totalGames: 21232,
        favorableMatchups: 5,
        performanceScore: "47.4"
      },
      {
        deck: "Aerodactyl-EX",
        winRate: "46.7",
        metaShare: "8.6",
        totalGames: 6666,
        favorableMatchups: 7,
        performanceScore: "41.9"
      },
      {
        deck: "Celebi-EX",
        winRate: "43.3",
        metaShare: "11.6",
        totalGames: 9036,
        favorableMatchups: 6,
        performanceScore: "41.8"
      }
    ],
    "C": [
      {
        deck: "Charizard-EX/Arcanine",
        winRate: "49.6",
        metaShare: "7.7",
        totalGames: 6014,
        favorableMatchups: 6,
        performanceScore: "40.2"
      },
      {
        deck: "Charizard-EX/Moltres",
        winRate: "45.1",
        metaShare: "8.8",
        totalGames: 6876,
        favorableMatchups: 5,
        performanceScore: "37.6"
      }
    ],
    "D": [
      {
        deck: "Arcanine-EX",
        winRate: "47.8",
        metaShare: "4.9",
        totalGames: 3810,
        favorableMatchups: 4,
        performanceScore: "32.4"
      },
      {
        deck: "Greninja",
        winRate: "46.6",
        metaShare: "4.0",
        totalGames: 3126,
        favorableMatchups: 3,
        performanceScore: "29.0"
      }
    ],
    "F": [
      {
        deck: "Serperior-Exeggutor",
        winRate: "49.3",
        metaShare: "2.9",
        totalGames: 2242,
        favorableMatchups: 1,
        performanceScore: "24.8"
      },
      {
        deck: "Golem-Druddigon",
        winRate: "40.3",
        metaShare: "5.4",
        totalGames: 4170,
        favorableMatchups: 1,
        performanceScore: "23.9"
      },
      {
        deck: "Scolipede",
        winRate: "41.5",
        metaShare: "3.6",
        totalGames: 2792,
        favorableMatchups: 1,
        performanceScore: "22.5"
      }
    ]
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <div className="flex items-center gap-4">
          <FaCrown className="text-4xl text-yellow-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Pokémon TCG Meta Analysis
          </h1>
        </div>

        {/* Meta Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <CustomCard title="Total Games" className="bg-white/50 backdrop-blur-sm">
            <div className="text-3xl font-bold">155,460</div>
          </CustomCard>
          <CustomCard title="Average Win Rate" className="bg-white/50 backdrop-blur-sm">
            <div className="text-3xl font-bold">46.52%</div>
          </CustomCard>
          <CustomCard title="Top Performer" className="bg-white/50 backdrop-blur-sm">
            <div className="text-3xl font-bold">Mewtwo-EX</div>
            <div className="text-sm text-gray-500">58.8 Performance Score</div>
          </CustomCard>
          <CustomCard title="Meta Diversity" className="bg-white/50 backdrop-blur-sm">
            <div className="text-3xl font-bold">15 Decks</div>
            <div className="text-sm text-gray-500">Across 6 Tiers</div>
          </CustomCard>
        </div>

        {/* First Ad Placement - After Meta Overview */}
        <div className="my-8">
          <GoogleAd />
        </div>

        {/* Tier Lists */}
        {Object.entries(tierData).map(([tier, decks]) => 
          decks.length > 0 && (
            <TierList key={tier} tier={tier as TierType} decks={decks} />
          )
        )}

        {/* Second Ad Placement - Before Charts */}
        <div className="my-8">
          <GoogleAd />
        </div>

        {/* Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CustomCard title="Win Rates by Deck" className="bg-white/50 backdrop-blur-sm">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(tierData).flatMap(([tier, decks]) => 
                    decks.map(deck => ({
                      name: deck.deck,
                      winRate: parseFloat(deck.winRate),
                      tier
                    }))
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis domain={[30, 60]} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="winRate" 
                    fill="#4CAF50"
                    name="Win Rate" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>

          <CustomCard title="Meta Share Distribution" className="bg-white/50 backdrop-blur-sm">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={Object.entries(tierData).flatMap(([tier, decks]) => 
                    decks.map(deck => ({
                      name: deck.deck,
                      metaShare: parseFloat(deck.metaShare),
                      tier
                    }))
                  )}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="metaShare" 
                    name="Meta Share"
                    radius={[4, 4, 0, 0]}
                  >
                    {Object.entries(tierData).flatMap(([tier, decks]) =>
                      decks.map((_deck, index) => (
                        <Cell key={`cell-${index}`} fill={colors[tier as TierType]} />
                      ))
                    )}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>
        </div>

        {/* Third Ad Placement - Before Key Insights */}
        <div className="my-8">
          <GoogleAd />
        </div>

        {/* Key Insights */}
        <CustomCard title="Key Insights" className="bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-lg">S-Tier Dominance</h3>
              <p className="text-gray-600">
                Mewtwo-EX leads with a remarkable 52.4% meta share and consistent performance across matchups.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Meta Diversity</h3>
              <p className="text-gray-600">
                15 competitive decks spread across 6 tiers, showing a healthy but concentrated competitive environment.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Performance Metrics</h3>
              <p className="text-gray-600">
                Top decks maintain favorable matchups against 6-8 other strategies, indicating balanced competition.
              </p>
            </div>
          </div>
        </CustomCard>
      </motion.div>
    </div>
  );
};

export default PokemonTierDashboard;
