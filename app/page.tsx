'use client';

import _ from 'lodash';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MatchData {
  deck1: string;
  deck2: string;
  wins: number;
  losses: number;
  ties: number;
  total: number;
  win_rate: number;
}

interface DeckStats {
  deck: string;
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
}

interface ChartData {
  deck: string;
  totalGames: number;
  winRate: string;
}

export default function Page() {
  const [data, setData] = useState<ChartData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/trainerhill-meta-matchups-2025-01-21.csv');
        const csvText = await response.text();
        const parsed = Papa.parse<MatchData>(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });

        // Get unique decks
        const decks = _.uniq([..._.map(parsed.data, 'deck1'), ..._.map(parsed.data, 'deck2')]);
        
        // Calculate stats for each deck
        const deckStats = decks.map(deck => {
          const asPlayer1 = parsed.data.filter(row => row.deck1 === deck);
          const asPlayer2 = parsed.data.filter(row => row.deck2 === deck);
          
          const wins = _.sumBy(asPlayer1, 'wins') + _.sumBy(asPlayer2, 'losses');
          const losses = _.sumBy(asPlayer1, 'losses') + _.sumBy(asPlayer2, 'wins');
          const totalGames = wins + losses;
          
          if (totalGames < 100) return null; // Filter out decks with few games
          
          return {
            deck: deck.split('-').slice(0, 3).join('-'),
            totalGames,
            wins,
            losses,
            winRate: (wins / totalGames * 100)
          };
        }).filter((deck): deck is DeckStats => deck !== null);

        // Sort by total games and take top 10
        const sortedData = _.orderBy(deckStats, ['totalGames'], ['desc'])
          .slice(0, 10)
          .map(deck => ({
            deck: deck.deck,
            totalGames: deck.totalGames,
            winRate: deck.winRate.toFixed(1)
          }));

        setData(sortedData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load Pokemon TCG data');
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl">{error || 'Failed to load data'}</div>
      </div>
    );
  }

  const totalGamesPlayed = _.sumBy(data, 'totalGames');
  const topDeck = _.maxBy(data, 'totalGames');
  const highestWinRate = _.maxBy(data, deck => parseFloat(deck.winRate));

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Pokemon TCG Meta Analysis</h1>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium">Total Games Analyzed</h3>
            <p className="text-2xl font-bold mt-2">{totalGamesPlayed.toLocaleString()}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium">Most Popular Deck</h3>
            <p className="text-2xl font-bold mt-2">{topDeck?.deck}</p>
            <p className="text-sm text-gray-500 mt-1">
              {((topDeck?.totalGames || 0) / totalGamesPlayed * 100).toFixed(1)}% of meta
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-gray-500 text-sm font-medium">Highest Win Rate</h3>
            <p className="text-2xl font-bold mt-2">{highestWinRate?.deck}</p>
            <p className="text-sm text-gray-500 mt-1">{highestWinRate?.winRate}% win rate</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Top Decks by Games Played</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="deck" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80} 
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalGames" fill="#3b82f6" name="Total Games" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Deck Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-medium">Deck</th>
                  <th className="text-right p-4 font-medium">Games Played</th>
                  <th className="text-right p-4 font-medium">Win Rate</th>
                  <th className="text-right p-4 font-medium">Meta Share</th>
                </tr>
              </thead>
              <tbody>
                {data.map(deck => (
                  <tr key={deck.deck} className="border-t hover:bg-gray-50">
                    <td className="p-4">{deck.deck}</td>
                    <td className="text-right p-4">{deck.totalGames.toLocaleString()}</td>
                    <td className="text-right p-4">{deck.winRate}%</td>
                    <td className="text-right p-4">
                      {((deck.totalGames / totalGamesPlayed) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}