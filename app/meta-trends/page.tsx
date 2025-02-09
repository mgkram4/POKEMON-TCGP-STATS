"use client"

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

interface TrendData {
  date: string;
  deck: string;
  winRate: number;
  metaShare: number;
  totalGames: number;
}

const MetaTrendsPage = () => {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [topDecks, setTopDecks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateTrendData = async () => {
      try {
        const response = await fetch('/api/meta-data');
        const data = await response.json();
        
        if (!data || !data.tiers) {
          throw new Error('Invalid data structure');
        }

        // Get all decks from tiers
        const allDecks = Object.values(data.tiers).flat() as DeckStats[];
        
        // Sort by total games to get top decks
        const sortedDecks = [...allDecks].sort((a, b) => b.totalGames - a.totalGames);
        const selectedTopDecks = sortedDecks.slice(0, 5).map(d => d.deck);
        setTopDecks(selectedTopDecks);

        // Generate artificial trend data for the past 3 weeks
        const dates = [
          '2025-01-07', 
          '2025-01-14', 
          '2025-01-21'
        ];

        const trends: TrendData[] = [];
        selectedTopDecks.forEach(deck => {
          const deckStats = allDecks.find(d => d.deck === deck)!;
          const baseWinRate = parseFloat(deckStats.winRate);
          const baseMetaShare = parseFloat(deckStats.metaShare);
          const baseTotalGames = deckStats.totalGames; // Use the actual total games

          dates.forEach((date, i) => {
            // Add some variance to create trends
            const variance = 1 + ((i - 1) * 0.1);
            trends.push({
              date,
              deck,
              winRate: baseWinRate * variance,
              metaShare: baseMetaShare * variance,
              totalGames: Math.round(baseTotalGames) // Use the full total, no division
            });
          });
        });

        setTrendData(trends);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading meta trends:', error);
        setIsLoading(false);
      }
    };

    generateTrendData();
  }, []);

  const formatDeckName = (name: string) => {
    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading trends...</div>
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
            Meta Trends
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <CustomCard title="Win Rate Trends" className="bg-white/50 backdrop-blur-sm">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[40, 60]}
                    label={{ 
                      value: 'Win Rate (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -10
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Win Rate']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  {topDecks.map((deck, index) => (
                    <Line
                      key={deck}
                      type="monotone"
                      dataKey="winRate"
                      data={trendData.filter(d => d.deck === deck)}
                      name={formatDeckName(deck)}
                      stroke={`hsl(${(index * 360) / topDecks.length}, 70%, 50%)`}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>

          <CustomCard title="Meta Share Trends" className="bg-white/50 backdrop-blur-sm">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    label={{ 
                      value: 'Meta Share (%)', 
                      angle: -90, 
                      position: 'insideLeft',
                      offset: -10
                    }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Meta Share']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  {topDecks.map((deck, index) => (
                    <Area
                      key={deck}
                      type="monotone"
                      dataKey="metaShare"
                      data={trendData.filter(d => d.deck === deck)}
                      name={formatDeckName(deck)}
                      fill={`hsl(${(index * 360) / topDecks.length}, 70%, 50%)`}
                      fillOpacity={0.3}
                      stroke={`hsl(${(index * 360) / topDecks.length}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CustomCard>

          <CustomCard title="Key Insights" className="bg-white/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Win Rate Stability</h3>
                <p className="text-gray-600">
                  Top decks maintain consistent win rates between 45-55%, showing a balanced meta.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Meta Share Shifts</h3>
                <p className="text-gray-600">
                  Popular decks show gradual meta share changes, indicating player adaptation.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg">Emerging Strategies</h3>
                <p className="text-gray-600">
                  New deck variants are gaining popularity while maintaining competitive win rates.
                </p>
              </div>
            </div>
          </CustomCard>
        </div>
      </motion.div>
    </div>
  );
};

export default MetaTrendsPage; 