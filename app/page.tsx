"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBolt, FaBrain, FaCrown, FaFire, FaFish, FaLeaf, FaWater } from 'react-icons/fa';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CustomCard } from './components/card';

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
  const router = useRouter();
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

  const handleClick = () => {
    // Convert deck name to URL-friendly slug
    const slug = deck.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    router.push(`/deck/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      onClick={handleClick}
    >
      <div className="p-4 rounded-lg hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm cursor-pointer">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {pokemonImage ? (
              <Image 
                src={pokemonImage.imageUrl} 
                alt={pokemonImage.name}
                width={48}
                height={48}
                priority={true}
                className="rounded-full"
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
        {/* Meta Overview Section */}
        <section className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-4">
                  <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg z-30">
                    <FaCrown className="text-4xl text-white" />
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg z-20">
                    <FaBrain className="text-4xl text-white" />
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg z-10">
                    <FaFire className="text-4xl text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Pokémon TCG Pocket Meta Analysis
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Live meta analysis and deck performance tracking
                  </p>
                </div>
              </div>
              <div className="md:ml-auto flex flex-col md:flex-row items-center gap-4">
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-md"
                >
                  <span className="font-semibold">Last Updated:</span> {new Date().toLocaleDateString()}
                </motion.div>
                <div className="flex -space-x-2">
                  {['mewtwo', 'charizard', 'pikachu'].map((pokemon) => (
                    <Image
                      key={pokemon}
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${
                        pokemon === 'mewtwo' ? '150' : 
                        pokemon === 'charizard' ? '6' : '25'
                      }.png`}
                      alt={pokemon}
                      width={48}
                      height={48}
                      priority={true}
                      className="rounded-full bg-white/50 p-1 shadow-lg"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <CustomCard 
                title="Total Games" 
                className="bg-gradient-to-br from-blue-50 to-blue-100"
                icon={<FaBolt className="text-2xl text-blue-500" />}
              >
                <div className="text-3xl font-bold text-blue-700">155,460</div>
              </CustomCard>
              <CustomCard 
                title="Average Win Rate" 
                className="bg-gradient-to-br from-purple-50 to-purple-100"
                icon={<FaBrain className="text-2xl text-purple-500" />}
              >
                <div className="text-3xl font-bold text-purple-700">46.52%</div>
              </CustomCard>
              <CustomCard 
                title="Top Performer" 
                className="bg-gradient-to-br from-green-50 to-green-100"
                icon={<FaCrown className="text-2xl text-green-500" />}
              >
                <div className="flex items-center gap-2">
                  <Image 
                    src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
                    alt="Mewtwo"
                    width={48}
                    height={48}
                    priority={true}
                  />
                  <div>
                    <div className="text-3xl font-bold text-green-700">Mewtwo-EX</div>
                    <div className="text-sm text-green-600">58.8 Performance Score</div>
                  </div>
                </div>
              </CustomCard>
              <CustomCard 
                title="Meta Diversity" 
                className="bg-gradient-to-br from-orange-50 to-orange-100"
                icon={<FaLeaf className="text-2xl text-orange-500" />}
              >
                <div className="text-3xl font-bold text-orange-700">15 Decks</div>
                <div className="text-sm text-orange-600">Across 6 Tiers</div>
              </CustomCard>
            </div>
          </div>
        </section>

        {/* Tier Lists Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Current Meta Tiers</h2>
          {Object.entries(tierData).map(([tier, decks]) => 
            decks.length > 0 && (
              <TierList key={tier} tier={tier as TierType} decks={decks} />
            )
          )}
        </section>

        {/* Performance Analysis Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Performance Analysis</h2>
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
        </section>

        {/* Key Insights Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Meta Insights</h2>
          <CustomCard className="bg-white/50 backdrop-blur-sm">
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
        </section>
      </motion.div>
    </div>
  );
};

export default PokemonTierDashboard;
