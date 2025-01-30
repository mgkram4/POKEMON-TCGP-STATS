"use client"

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaCrown, FaChartLine, FaStar, FaUsers, FaFire } from 'react-icons/fa';
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

// World Championships Theme Colors
const themeColors = {
  primary: '#E3350D',    // Championship Red
  secondary: '#0055B7',  // Championship Blue
  tertiary: '#00A058',   // Championship Green
  quaternary: '#FDD23C', // Championship Yellow
  accent: '#919191',     // Silver
  text: '#2F3542'        // Dark text
};

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

// Keep existing helper functions...
[Previous getPokemonNameForApi and getPokemonImage functions remain the same]

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
      className: `text-lg font-bold text-${themeColors.primary}`,
      icon: FaUsers
    },
    winRate: {
      value: `${deck.winRate}%`,
      className: `text-lg font-bold text-${themeColors.tertiary}`,
      icon: FaChartLine
    },
    matchups: {
      value: deck.favorableMatchups.toString(),
      className: `text-lg font-bold text-${themeColors.secondary}`,
      icon: FaStar
    }
  };

  const StatIcon = statDisplay[showStat].icon;

  return (
    <motion.div 
      whileHover={{ x: 4 }}
      className="flex justify-between items-center p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-gray-200 hover:border-gray-300 transition-all"
    >
      <div className="flex items-center gap-3">
        {pokemonImage ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-50">
            <Image 
              src={pokemonImage.imageUrl} 
              alt={pokemonImage.name}
              layout="fill"
              objectFit="contain"
              className="p-1"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 animate-pulse" />
        )}
        <div>
          <div className="font-medium text-gray-900">{formatDeckName(deck.deck)}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <StatIcon className="text-xs" />
            {showStat === "games" ? "Total Games" : 
             showStat === "winRate" ? "Win Rate" : 
             "Favorable Matchups"}
          </div>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full bg-gray-100 ${statDisplay[showStat].className}`}>
        {statDisplay[showStat].value}
      </div>
    </motion.div>
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
        <motion.div 
          key={index}
          whileHover={{ x: 2 }}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
        >
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          {images[entry.payload.deck] ? (
            <Image 
              src={images[entry.payload.deck]} 
              alt={entry.payload.deck}
              width={24}
              height={24}
              className="rounded-full bg-gray-50 p-0.5"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse" />
          )}
          <span className="font-medium text-gray-900">
            {entry.payload.deck
              .split('-')
              .map(part => part.charAt(0).toUpperCase() + part.slice(1))
              .join(' ')}
          </span>
          <span className="text-gray-500">
            ({((entry.payload.totalGames / totalGames) * 100).toFixed(1)}%)
          </span>
        </motion.div>
      ))}
    </div>
  );
};

const DeckStatsPage = () => {
  const [deckStats, setDeckStats] = useState<DeckStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xl text-gray-600 font-medium">Loading statistics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-8 space-y-8"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E3350D] to-[#0055B7] rounded-xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <FaCrown className="text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                Tournament Statistics
              </h1>
              <p className="text-white/80">
                Comprehensive analysis of deck performance and meta trends
              </p>
            </div>
          </div>
        </div>

        {/* Top Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomCard 
            title="Most Played Decks" 
            className="bg-white border border-gray-200"
            icon={<FaUsers className="text-2xl text-[#E3350D]" />}
          >
            <div className="space-y-3">
              {deckStats
                .sort((a, b) => b.totalGames - a.totalGames)
                .slice(0, 5)
                .map((deck, index) => (
                  <DeckItem key={index} deck={deck} showStat="games" />
                ))}
            </div>
          </CustomCard>

          <CustomCard 
            title="Highest Win Rates" 
            className="bg-white border border-gray-200"
            icon={<FaChartLine className="text-2xl text-[#00A058]" />}
          >
            <div className="space-y-3">
              {[...deckStats]
                .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                .slice(0, 5)
                .map((deck, index) => (
                  <DeckItem key={index} deck={deck} showStat="winRate" />
                ))}
            </div>
          </CustomCard>

          <CustomCard 
            title="Most Favorable Matchups" 
            className="bg-white border border-gray-200"
            icon={<FaStar className="text-2xl text-[#0055B7]" />}
          >
            <div className="space-y-3">
              {[...deckStats]
                .sort((a, b) => b.favorableMatchups - a.favorableMatchups)
                .slice(0, 5)
                .map((deck, index) => (
                  <DeckItem key={index} deck={deck} showStat="matchups" />
                ))}
            </div>
          </CustomCard>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomCard 
            title="Win Rates Distribution" 
            className="bg-white border border-gray-200"
            icon={<FaChartLine className="text-2xl text-[#0055B7]" />}
          >
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...deckStats]
                    .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                    .slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                  <XAxis 
                    dataKey="deck" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                    tick={{ fontSize: 12, fill: '#4B5563' }}
                    tickFormatter={(value: string) => value
                      .split('-')
                      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ')
                    }
                  />
                  <YAxis 
                    domain={[40, 60]}
                    tick={{ fill: '#4B5563' }}
                    label={{ 
                      value: 'Win Rate (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -20,
                      fill: '#4B5563'
                    }}
                  />
                  <Tooltip
                    formatter={(value: string) => [`${value}%`, 'Win Rate']}
                    labelFormatter={(label: string) => label
                      .split('-')
                      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
                      .join(' ')
                    }
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
                    {[...deckStats]
                      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
                      .slice(0, 10)
                      .map((_, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={`hsl(${index * 36}, 70%, 50%)`}
                        />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>

          <CustomCard 
            title="Meta Share Distribution" 
            className="bg-white border border-gray-200"
            icon={<FaUsers className="text-2xl text-[#E3350D]" />}
          >
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
                  
                          fill={[
                            themeColors.primary,    // Championship Red
                            themeColors.secondary,  // Championship Blue
                            themeColors.tertiary,   // Championship Green
                            themeColors.quaternary, // Championship Yellow
                            '#A65D9E',             // Purple
                            '#FF8C00',             // Orange
                            '#4CAF50',             // Green
                            '#9C27B0'              // Deep Purple
                          ][index]}
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
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CustomCard>
          </div>
  
          {/* Summary Section */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Meta Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaUsers className="text-[#E3350D]" />
                  <h3 className="text-sm font-medium text-gray-600">Total Games Analyzed</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {deckStats.reduce((acc, curr) => acc + curr.totalGames, 0).toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaChartLine className="text-[#00A058]" />
                  <h3 className="text-sm font-medium text-gray-600">Average Win Rate</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {(deckStats.reduce((acc, curr) => acc + parseFloat(curr.winRate), 0) / deckStats.length).toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FaCrown className="text-[#FDD23C]" />
                  <h3 className="text-sm font-medium text-gray-600">Active Decks</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {deckStats.length}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
  
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-gray-600">
                © 2025 Pokemon TCG World Championships
              </p>
              <p className="text-sm text-gray-500 mt-1">
                All Pokemon-related content belongs to Nintendo & The Pokemon Company
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  };
  
  export default DeckStatsPage;