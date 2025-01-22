import _ from 'lodash';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function SimplePokemonDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await window.fs.readFile('paste-2.txt', { encoding: 'utf8' });
        const parsed = Papa.parse(response, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true
        });

        // Get unique decks and calculate their stats
        const decks = _.uniq([..._.map(parsed.data, 'deck1'), ..._.map(parsed.data, 'deck2')]);
        
        const deckStats = decks.map(deck => {
          const games = parsed.data.filter(row => 
            (row.deck1 === deck || row.deck2 === deck) && row.total >= 100
          );
          
          if (games.length === 0) return null;

          const totalGames = _.sumBy(games, 'total');
          const wins = _.sumBy(games, game => 
            game.deck1 === deck ? game.wins : game.losses
          );

          return {
            deck: deck.split('-').slice(0, 2).join('-'),
            totalGames,
            winRate: (wins / totalGames * 100).toFixed(1)
          };
        }).filter(Boolean);

        // Sort by total games and take top 10
        setData(_.orderBy(deckStats, ['totalGames'], ['desc']).slice(0, 10));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    }

    loadData();
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Pokemon TCG Meta Analysis</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-lg">
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

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Deck Statistics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Deck</th>
                  <th className="text-right p-2">Games</th>
                  <th className="text-right p-2">Win Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map(deck => (
                  <tr key={deck.deck} className="border-b hover:bg-gray-50">
                    <td className="p-2">{deck.deck}</td>
                    <td className="text-right p-2">{deck.totalGames.toLocaleString()}</td>
                    <td className="text-right p-2">{deck.winRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}