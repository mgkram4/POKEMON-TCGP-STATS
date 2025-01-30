"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBolt, FaBrain, FaCrown, FaLeaf } from 'react-icons/fa';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CustomCard } from './components/card';

// Pokémon TCG Theme Colors matching World Championships
type TierType = 'S' | 'A' | 'B' | 'C' | 'D' | 'F';

const colors: Record<TierType, string> = {
  S: '#E3350D',    // Championship Red
  A: '#0055B7',    // Championship Blue
  B: '#00A058',    // Championship Green
  C: '#FDD23C',    // Championship Yellow
  D: '#A65D9E',    // Purple
  F: '#919191'     // Silver
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

const getTierColorClass = (tier: TierType): string => ({
  'S': 'text-[#E3350D]',
  'A': 'text-[#0055B7]',
  'B': 'text-[#00A058]',
  'C': 'text-[#FDD23C]',
  'D': 'text-[#A65D9E]',
  'F': 'text-[#919191]'
}[tier]);

const getPokemonNameForApi = (deckName: string): string => {
  const normalized = deckName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  
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

  const handleClick = () => {
    const slug = deck.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');    
    
    router.push(`/deck/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ boxShadow: "0 8px 20px -4px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      className="w-full"
      onClick={handleClick}
    >
      <div className="p-4 rounded-lg bg-white/80 backdrop-blur-sm cursor-pointer">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
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
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            )}
            <span className="text-sm font-medium">{deck}</span>
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
      transition={{ delay: 0.1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-8 rounded-full`} style={{ backgroundColor: colors[tier] }} />
        <h2 className={`text-2xl font-bold ${getTierColorClass(tier)}`}>
          Tier {tier}
        </h2>
      </div>
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

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {/* Header Skeleton */}
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8">
      <div className="flex items-center gap-6 mb-8">
        <div className="flex space-x-4">
          <div className="h-20 w-20 bg-gray-200 rounded-full" />
          <div className="h-20 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-48 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>

    {/* Tier List Loading Skeletons */}
    {[...Array(3)].map((_, i) => (
      <div key={i} className="mb-8">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="p-4 bg-white/80 rounded-lg h-48" />
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

  const totalGames = Object.values(tierData)
    .flat()
    .reduce((sum, deck) => sum + deck.totalGames, 0);

  const topPerformer = Object.values(tierData)
    .flat()
    .reduce((top, deck) => {
      return (!top || parseFloat(deck.performanceScore) > parseFloat(top.performanceScore)) ? deck : top;
    }, null as DeckStats | null);

  const averageWinRate = Object.values(tierData)
    .flat()
    .reduce((sum, deck) => sum + parseFloat(deck.winRate), 0) / 
    Object.values(tierData).flat().length;

  const totalDecks = Object.values(tierData).flat().length;

  const isTierType = (tier: unknown): tier is TierType => {
    return typeof tier === 'string' && ['S', 'A', 'B', 'C', 'D', 'F'].includes(tier as string);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* World Championships Style Header */}
      <header className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Left side with Legendary Pokemon */}
            <div className="flex items-center gap-4">
              <Image
                 src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/483.png"
                alt="Dialga"
                width={120}
                height={120}
                priority
                className="object-contain filter drop-shadow-lg hover:scale-105 transition-transform"
              />
              <Image
                 src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/484.png"
                alt="Palkia"
                width={120}
                height={120}
                priority
                className="object-contain filter drop-shadow-lg hover:scale-105 transition-transform"
              />
            </div>

            {/* Center content */}
            <div className="text-center lg:text-left flex-1">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <div className="text-sm text-gray-500 mb-1">TCGPocketMeta presents</div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 via-blue-500 to-green-500 bg-clip-text text-transparent">
                  Space-Time Smackdown
                </h1>
                <p className="text-lg text-gray-600">
                  Meta Analysis & Tournament Statistics
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2"
              >
                <span className="w-2 h-2 rounded-full animate-pulse bg-green-500"/>
                <span className="text-sm text-gray-600">Live Updates: {currentDate}</span>
              </motion.div>
            </div>

            {/* World Championships Logo */}
            <motion.div
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 0.5 }}
              className="relative w-32 h-32"
            >
              <div className="absolute inset-0 rounded-full border-4 border-t-[#E3350D] border-r-[#0055B7] border-b-[#00A058] border-l-[#FDD23C]" />
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center shadow-inner">
                <div className="w-12 h-12 rounded-full border-2 border-gray-300" />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="space-y-12">
            {/* Stats Overview */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <CustomCard 
                title="Total Games" 
                className="bg-gradient-to-br from-red-50 to-red-100"
                icon={<FaBolt className="text-2xl text-[#E3350D]" />}
              >
                <div className="text-3xl font-bold text-gray-900">
                  {totalGames.toLocaleString()}
                </div>
              </CustomCard>

              <CustomCard 
                title="Average Win Rate" 
                className="bg-gradient-to-br from-blue-50 to-blue-100"
                icon={<FaBrain className="text-2xl text-[#0055B7]" />}
              >
                <div className="text-3xl font-bold text-gray-900">
                  {averageWinRate.toFixed(1)}%
                </div>
              </CustomCard>

              <CustomCard 
                title="Top Performer" 
                className="bg-gradient-to-br from-green-50 to-green-100"
                icon={<FaCrown className="text-2xl text-[#00A058]" />}
              >
                {topPerformer && (
                  <div>
                    <div className="text-xl font-bold text-gray-900">{topPerformer.deck}</div>
                    <div className="text-sm text-gray-600">{topPerformer.performanceScore} Score</div>
                  </div>
                )}
              </CustomCard>

              <CustomCard 
                title="Meta Diversity" 
                className="bg-gradient-to-br from-yellow-50 to-yellow-100"
                icon={<FaLeaf className="text-2xl text-[#FDD23C]" />}
              >
                <div className="text-3xl font-bold text-gray-900">{totalDecks}</div>
                <div className="text-sm text-gray-600">
                  Across {Object.keys(tierData).length} Tiers
                </div>
              </CustomCard>
            </section>

            {/* Tier Lists */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Current Meta Tiers</h2>
              <div className="space-y-12">
                {Object.entries(tierData).map(([tier, decks]) => 
                  decks.length > 0 && (
                    <TierList key={tier} tier={tier as TierType} decks={decks} />
                  )
                )}
              </div>
            </section>

            {/* Charts */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Win Rate Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Win Rates Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer>
                    <BarChart
                      data={Object.values(tierData).flat()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis 
                        dataKey="deck" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fill: '#4B5563' }}
                      />
                      <YAxis tick={{ fill: '#4B5563' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="winRate"
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
              </div>

              {/* Meta Share Chart */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Meta Share Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer>
                    <BarChart
                      data={Object.values(tierData).flat()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                      <XAxis 
                        dataKey="deck" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fill: '#4B5563' }}
                      />
                      <YAxis tick={{ fill: '#4B5563' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar 
                        dataKey="metaShare"
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
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-600">
            © 2025 Pokemon TCG World Championships. All Pokemon-related content belongs to Nintendo & The Pokemon Company.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PokemonTierDashboard;