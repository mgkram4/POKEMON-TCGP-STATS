"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { CustomCard } from '../components/card';

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

interface LegendPayload {
  color: string;
  payload: DeckStats;
}

// Pokemon API helper functions
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

const DeckItem = ({ deck, showStat = "games" }: { deck: DeckStats, showStat?: "games" | "winRate" | "matchups" }) => {
  const [pokemonImage, setPokemonImage] = useState<PokemonImage | null>(null);
  
  useEffect(() => {
    const loadPokemonImage = async () => {
      const image = await getPokemonImage(deck.deck);
      setPokemonImage(image);
    };
    loadPokemonImage();
  }, [deck.deck]);

  const formatDeckName = (name: string) => {
    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const statDisplay = {
    games: {
      value: deck.totalGames.toLocaleString(),
      className: "text-lg font-bold"
    },
    winRate: {
      value: `${deck.winRate}%`,
      className: "text-lg font-bold text-green-600"
    },
    matchups: {
      value: deck.favorableMatchups.toString(),
      className: "text-lg font-bold text-blue-600"
    }
  };

  return (
    <div className="flex justify-between items-center p-2 rounded-lg hover:bg-white/30 transition-colors">
      <div className="flex items-center gap-3">
        {pokemonImage ? (
          <Image 
            src={pokemonImage.imageUrl} 
            alt={pokemonImage.name}
            width={40}
            height={40}
            className="object-contain"
          />
        ) : (
          <FaCrown className="text-xl text-yellow-500" />
        )}
        <div>
          <div className="font-medium">{formatDeckName(deck.deck)}</div>
          <div className="text-xs text-gray-500">
            {showStat === "games" ? "Total Games" : 
             showStat === "winRate" ? "Win Rate" : 
             "Favorable Matchups"}
          </div>
        </div>
      </div>
      <div className={statDisplay[showStat].className}>
        {statDisplay[showStat].value}
      </div>
    </div>
  );
};

const CustomLegend = ({ payload, deckStats }: { 
  payload: LegendPayload[];
  deckStats: DeckStats[];
}) => {
  const [images, setImages] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = payload.map(async (entry) => {
        const image = await getPokemonImage(entry.payload.deck);
        if (image) {
          return [entry.payload.deck, image.imageUrl];
        }
        return null;
      });

      const loadedImages = await Promise.all(imagePromises);
      const imageMap: Record<string, string> = {};
      loadedImages.forEach(item => {
        if (item) {
          imageMap[item[0]] = item[1];
        }
      });
      setImages(imageMap);
    };

    loadImages();
  }, [payload]);

  const totalGames = deckStats.reduce((acc, curr) => acc + curr.totalGames, 0);

  return (
    <div className="flex flex-col gap-2 text-sm">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          {images[entry.payload.deck] && (
            <Image 
              src={images[entry.payload.deck]} 
              alt={entry.payload.deck}
              width={24}
              height={24}
              className="object-contain"
            />
          )}
          <span className="font-medium">
            {entry.payload.deck
              .split('-')
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ')}
          </span>
          <span className="text-gray-500">
            ({((entry.payload.totalGames / totalGames) * 100).toFixed(1)}%)
          </span>
        </div>
      ))}
    </div>
  );
};

const DeckStatsPage = () => {
  const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDeckStats = async () => {
      try {
        const response = await fetch('/api/meta-data');
        const data = await response.json();
        
        if (data && data.tiers) {
          const statsArray = Object.values(data.tiers).flat() as DeckStats[];
          setDeckStats(statsArray);
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading deck stats:', error);
        setIsLoading(false);
      }
    };

    loadDeckStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading stats...</div>
      </div>
    );
  }

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
            Deck Statistics
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomCard title="Most Played Decks" className="bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              {deckStats
                .sort((a, b) => b.totalGames - a.totalGames)
                .slice(0, 5)
                .map((deck, index) => (
                  <DeckItem key={index} deck={deck} showStat="games" />
                ))}
            </div>
          </CustomCard>

          <CustomCard title="Highest Win Rates" className="bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              {[...deckStats]
                .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                .slice(0, 5)
                .map((deck, index) => (
                  <DeckItem key={index} deck={deck} showStat="winRate" />
                ))}
            </div>
          </CustomCard>

          <CustomCard title="Most Favorable Matchups" className="bg-white/50 backdrop-blur-sm">
            <div className="space-y-2">
              {[...deckStats]
                .sort((a, b) => b.favorableMatchups - a.favorableMatchups)
                .slice(0, 5)
                .map((deck, index) => (
                  <DeckItem key={index} deck={deck} showStat="matchups" />
                ))}
            </div>
          </CustomCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomCard title="Win Rates Distribution" className="bg-white/50 backdrop-blur-sm">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...deckStats]
                    .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                    .slice(0, 10)}
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
                    tickFormatter={(value: string) => value
                      .split('-')
                      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ')
                    }
                  />
                  <YAxis 
                    domain={[40, 60]}
                    label={{ 
                      value: 'Win Rate (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -20
                    }}
                  />
                  <Tooltip
                    formatter={(value: string) => [`${value}%`, 'Win Rate']}
                    labelFormatter={(label: string) => label
                      .split('-')
                      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ')
                    }
                  />
                  <Bar 
                    dataKey="winRate"
                    fill="#4CAF50"
                    radius={[4, 4, 0, 0]}
                  >
                    {[...deckStats]
                      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                      .slice(0, 10)
                      .map((_, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`hsl(${120 + (index * 5)}, 70%, 45%)`}
                        />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>

          <CustomCard title="Meta Share Distribution" className="bg-white/50 backdrop-blur-sm">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deckStats.slice(0, 8)}
                    dataKey="totalGames"
                    nameKey="deck"
                    cx="35%"
                    cy="50%"
                    outerRadius={80}
                    label={false}
                  >
                    {deckStats.slice(0, 8).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`hsl(${(index * 360) / 8}, 70%, 50%)`}
                      />
                    ))}
                  </Pie>
                  <Legend 
                    content={(props) => 
                      props.payload ? 
                        <CustomLegend 
                          payload={props.payload.map(item => ({
                            color: item.color || '#000000',
                            payload: item.payload as unknown as DeckStats
                          }))} 
                          deckStats={deckStats} 
                        /> :
                        null
                    }
                    layout="vertical"
                    align="right"
                    verticalAlign="middle"
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${((value / deckStats.reduce((acc, curr) => acc + curr.totalGames, 0)) * 100).toFixed(1)}%`,
                      'Meta Share'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>
        </div>
      </motion.div>
    </div>
  );
};

export default DeckStatsPage; 