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
  const [actualTier, setActualTier] = useState<TierType>(tier);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/meta-data');
        const data = await response.json();
        
        if (data.insights && data.insights[deck]) {
          // Use the tier from insights instead of the prop
          setActualTier(data.insights[deck].tier);
        }
      } catch (error) {
        console.error('Error loading tier data:', error);
      }
    };

    loadData();
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
    // Create a consistent slug format
    const slug = deck.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace special chars with hyphens
      .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
    
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
          <div className={`px-2 py-1 rounded text-xs font-bold ${getTierColorClass(actualTier)}`}>
            Tier {actualTier}
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

// Add this new loading component near the top of the file
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="h-24 w-48 bg-gray-200 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Tier List Loading Skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="mb-8">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="p-4 bg-white/80 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const PokemonTierDashboard = () => {
  const [currentDate, setCurrentDate] = useState<string>('');
  const [tierData, setTierData] = useState<Record<TierType, DeckStats[]>>({
    S: [], A: [], B: [], C: [], D: [], F: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString());

    const loadMetaData = async () => {
      try {
        const response = await fetch('/api/meta-data');
        const data = await response.json();
        
        if (data && data.deckDetails && data.insights) {
          // Organize decks by their insight tiers
          const organizedTiers: Record<TierType, DeckStats[]> = {
            S: [], A: [], B: [], C: [], D: [], F: []
          };
          
          Object.entries(data.deckDetails).forEach(([deckName, deckStats]) => {
            const deckInsights = data.insights[deckName] as { tier: unknown };
            if (deckInsights && isTierType(deckInsights.tier)) {
              organizedTiers[deckInsights.tier].push(deckStats as DeckStats);
            }
          });
          
          setTierData(organizedTiers);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading meta data:', error);
        setIsLoading(false);
      }
    };

    loadMetaData();
  }, []);

  // Calculate total games across all tiers
  const totalGames = Object.values(tierData)
    .flat()
    .reduce((sum, deck) => sum + deck.totalGames, 0);

  // Find the top performer
  const topPerformer = Object.values(tierData)
    .flat()
    .reduce((top, deck) => {
      return (!top || parseFloat(deck.performanceScore) > parseFloat(top.performanceScore)) ? deck : top;
    }, null as DeckStats | null);

  // Calculate average win rate
  const averageWinRate = Object.values(tierData)
    .flat()
    .reduce((sum, deck) => sum + parseFloat(deck.winRate), 0) / 
    Object.values(tierData).flat().length;

  // Count total unique decks
  const totalDecks = Object.values(tierData).flat().length;

  // Add type guard function
  const isTierType = (tier: unknown): tier is TierType => {
    return typeof tier === 'string' && ['S', 'A', 'B', 'C', 'D', 'F'].includes(tier as string);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            {/* Meta Overview Section */}
            <section className="mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-6">
                      <div className="p-4 bg-gradient-to-br from-pink-400 to-purple-600 rounded-xl shadow-lg z-30 transform hover:scale-110 transition-transform">
                        <Image
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/151.png"
                          alt="Mew"
                          width={60}
                          height={60}
                          className="filter brightness-0 invert"
                        />
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg z-20 transform hover:scale-110 transition-transform">
                        <Image
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/130.png"
                          alt="Gyarados"
                          width={60}
                          height={60}
                          className="filter brightness-0 invert"
                        />
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl shadow-lg z-10 transform hover:scale-110 transition-transform">
                        <Image
                          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/251.png"
                          alt="Celebi"
                          width={60}
                          height={60}
                          className="filter brightness-0 invert"
                        />
                      </div>
                    </div>
                    <div>
                      <h1 className="text-sm font-medium text-gray-600 mb-1">
                        TCG POCKET META
                      </h1>
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                        Mythical Island Meta Analysis
                      </h2>
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
                      className="px-4 py-2 bg-gradient-to-r from-pink-500 via-blue-500 to-emerald-500 text-white rounded-lg shadow-md"
                    >
                      <span className="font-semibold">Last Updated:</span> {currentDate}
                    </motion.div>
                    <div className="flex -space-x-3">
                      {[151, 130, 251].map((pokemonId) => (
                        <Image
                          key={pokemonId}
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`}
                          alt={`Pokemon ${pokemonId}`}
                          width={64}
                          height={64}
                          priority={true}
                          className="rounded-full bg-white/50 p-1 shadow-lg hover:scale-110 transition-transform"
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
                    <div className="text-3xl font-bold text-blue-700">
                      {totalGames.toLocaleString()}
                    </div>
                  </CustomCard>
                  <CustomCard 
                    title="Average Win Rate" 
                    className="bg-gradient-to-br from-purple-50 to-purple-100"
                    icon={<FaBrain className="text-2xl text-purple-500" />}
                  >
                    <div className="text-3xl font-bold text-purple-700">
                      {averageWinRate.toFixed(1)}%
                    </div>
                  </CustomCard>
                  <CustomCard 
                    title="Top Performer" 
                    className="bg-gradient-to-br from-green-50 to-green-100"
                    icon={<FaCrown className="text-2xl text-green-500" />}
                  >
                    {topPerformer && (
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="text-xl font-bold text-green-700">{topPerformer.deck}</div>
                          <div className="text-sm text-green-600">{topPerformer.performanceScore} Performance Score</div>
                        </div>
                      </div>
                    )}
                  </CustomCard>
                  <CustomCard 
                    title="Meta Diversity" 
                    className="bg-gradient-to-br from-orange-50 to-orange-100"
                    icon={<FaLeaf className="text-2xl text-orange-500" />}
                  >
                    <div className="text-3xl font-bold text-orange-700">{totalDecks} Decks</div>
                    <div className="text-sm text-orange-600">Across {Object.keys(tierData).length} Tiers</div>
                  </CustomCard>
                </div>
              </div>
            </section>

            {/* Tier Lists Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Current Meta Tiers</h2>
              {!isLoading && Object.entries(tierData).map(([tier, decks]) => 
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
                        data={Object.values(tierData).flat()}
                        margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="deck" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis domain={[30, 70]} />
                        <Tooltip />
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
                        data={Object.values(tierData).flat()}
                        margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis 
                          dataKey="deck" 
                          angle={-45} 
                          textAnchor="end" 
                          height={80}
                          interval={0}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar 
                          dataKey="metaShare" 
                          name="Meta Share"
                          radius={[4, 4, 0, 0]}
                        >
                          {Object.values(tierData).flat().map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={colors[Object.keys(tierData).find(
                                tier => tierData[tier as TierType].includes(entry)
                              ) as TierType] || '#000000'} 
                            />
                          ))}
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
                  {topPerformer && (
                    <div className="space-y-2">
                      <h3 className="font-bold text-lg">Top Tier Performance</h3>
                      <p className="text-gray-600">
                        {topPerformer.deck} leads with a {topPerformer.metaShare}% meta share and {topPerformer.favorableMatchups} favorable matchups.
                      </p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Meta Diversity</h3>
                    <p className="text-gray-600">
                      {totalDecks} competitive decks spread across {Object.keys(tierData).length} tiers, showing a {
                        totalDecks > 10 ? 'healthy' : 'concentrated'
                      } competitive environment.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Performance Metrics</h3>
                    <p className="text-gray-600">
                      Average win rate of {averageWinRate.toFixed(1)}% across {totalGames.toLocaleString()} total games played.
                    </p>
                  </div>
                </div>
              </CustomCard>
            </section>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default PokemonTierDashboard;