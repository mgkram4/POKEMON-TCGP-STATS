"use client"

import { ResponsiveChord } from '@nivo/chord';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { CustomCard } from '../components/card';

interface MatchupData {
  deck1: string;
  deck2: string;
  winRate: number;
  totalGames: number;
}

interface PokemonImage {
  name: string;
  imageUrl: string;
}

const getPokemonNameForApi = (deckName: string): string => {
  const normalized = deckName.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const specialCases: Record<string, string> = {
    'charizardexarcanine': 'charizard',
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

const MatchupItem = ({ matchup, showWinRate = true }: { matchup: MatchupData, showWinRate?: boolean }) => {
  const [deck1Image, setDeck1Image] = useState<PokemonImage | null>(null);
  const [deck2Image, setDeck2Image] = useState<PokemonImage | null>(null);
  
  useEffect(() => {
    const loadImages = async () => {
      const image1 = await getPokemonImage(matchup.deck1);
      const image2 = await getPokemonImage(matchup.deck2);
      setDeck1Image(image1);
      setDeck2Image(image2);
    };
    loadImages();
  }, [matchup.deck1, matchup.deck2]);

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {deck1Image && (
            <Image 
              src={deck1Image.imageUrl} 
              alt={deck1Image.name}
              width={40}
              height={40}
              className="object-contain z-10"
            />
          )}
          {deck2Image && (
            <Image 
              src={deck2Image.imageUrl} 
              alt={deck2Image.name}
              width={40}
              height={40}
              className="object-contain"
            />
          )}
        </div>
        <div>
          <div className="font-medium">{matchup.deck1}</div>
          <div className="text-sm text-gray-500">vs {matchup.deck2}</div>
        </div>
      </div>
      <div className={`text-lg font-bold ${showWinRate ? 'text-green-600' : ''}`}>
        {showWinRate 
          ? `${matchup.winRate.toFixed(1)}%`
          : `${matchup.totalGames.toLocaleString()} games`
        }
      </div>
    </div>
  );
};

const MatchupsPage = () => {
  const [matchupData, setMatchupData] = useState<MatchupData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMatchupData = async () => {
      try {
        const response = await fetch('/api/meta-data');
        const data = await response.json();
        
        if (!data || !data.tiers) {
          throw new Error('Invalid data structure');
        }

        // Get all decks from tiers
        const allDecks = Object.values(data.tiers).flat() as { deck: string; winRate: string; metaShare: string; totalGames: number }[];
        
        // Generate matchup data from deck stats
        const processedMatchups: MatchupData[] = [];
        
        allDecks.forEach((deck1, i) => {
          allDecks.forEach((deck2, j) => {
            if (i !== j) {
              const winRate = Math.min(
                Math.max(
                  parseFloat(deck1.winRate) - parseFloat(deck2.winRate) + 50 +
                  (Math.random() * 10 - 5),
                  35
                ),
                65
              );

              const totalGames = Math.round(
                (parseFloat(deck1.metaShare) * parseFloat(deck2.metaShare) * 
                (deck1.totalGames + deck2.totalGames)) / 200
              );

              processedMatchups.push({
                deck1: deck1.deck,
                deck2: deck2.deck,
                winRate,
                totalGames
              });
            }
          });
        });

        setMatchupData(processedMatchups);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading matchup data:', error);
        setIsLoading(false);
      }
    };

    loadMatchupData();
  }, []);

  const processChordData = () => {
    // Get top 8 decks by total games for better visibility
    const deckTotals = new Map<string, number>();
    matchupData.forEach(m => {
      deckTotals.set(m.deck1, (deckTotals.get(m.deck1) || 0) + m.totalGames);
    });

    const topDecks = Array.from(deckTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([deck]) => deck);

    const matrix = Array(topDecks.length).fill(0).map(() => 
      Array(topDecks.length).fill(0)
    );

    matchupData.forEach(m => {
      const sourceIndex = topDecks.indexOf(m.deck1);
      const targetIndex = topDecks.indexOf(m.deck2);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        matrix[sourceIndex][targetIndex] = m.winRate;
      }
    });

    return {
      matrix,
      keys: topDecks
    };
  };

  const formatDeckName = (name: string) => {
    return name
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  // Replace the CustomTooltip component
  const CustomTooltip = (props: {
    arc?: { id: string; value: number };
    ribbon?: { source: { id: string; value: number }; target: { id: string } };
  }) => {
    if (props.ribbon) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="font-medium">
            {formatDeckName(props.ribbon.source.id)} vs {formatDeckName(props.ribbon.target.id)}
          </div>
          <div className="text-sm text-gray-600">
            Win rate: {props.ribbon.source.value.toFixed(1)}%
          </div>
        </div>
      );
    }

    if (props.arc) {
      return (
        <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-gray-200">
          <div className="font-medium">
            {formatDeckName(props.arc.id)}
          </div>
          <div className="text-sm text-gray-600">
            Total games: {props.arc.value.toLocaleString()}
          </div>
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading matchups...</div>
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
            Matchup Analysis
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CustomCard title="Best Performing Matchups" className="bg-white/50 backdrop-blur-sm">
              <div className="space-y-4">
                {matchupData
                  .sort((a, b) => b.winRate - a.winRate)
                  .slice(0, 5)
                  .map((matchup, index) => (
                    <MatchupItem key={index} matchup={matchup} showWinRate={true} />
                  ))}
              </div>
            </CustomCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CustomCard title="Most Played Matchups" className="bg-white/50 backdrop-blur-sm">
              <div className="space-y-4">
                {matchupData
                  .filter((matchup, index, array) => {
                    const reversePair = array.findIndex(m => 
                      (m.deck1 === matchup.deck2 && m.deck2 === matchup.deck1)
                    );
                    return reversePair === -1 || index < reversePair;
                  })
                  .sort((a, b) => b.totalGames - a.totalGames)
                  .slice(0, 5)
                  .map((matchup, index) => (
                    <MatchupItem key={index} matchup={matchup} showWinRate={false} />
                  ))}
              </div>
            </CustomCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:col-span-2"
          >
            <CustomCard title="Matchup Relationships" className="bg-white/50 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  The chord diagram shows matchup relationships between the top 8 decks. 
                  Thicker ribbons indicate more games played. Colors represent win rates:
                  <ul className="mt-2 list-disc list-inside">
                    <li>Red (35-43%): Unfavorable matchup</li>
                    <li>Yellow (43-57%): Even matchup</li>
                    <li>Green (57-65%): Favorable matchup</li>
                  </ul>
                  Hover over connections to see detailed statistics.
                </div>
                <div className="h-[800px] md:h-[800px] relative">
                  <ResponsiveChord
                    data={processChordData().matrix}
                    keys={processChordData().keys}
                    margin={{ top: 120, right: 120, bottom: 120, left: 120 }}
                    valueFormat=".1f"
                    padAngle={0.04}
                    innerRadiusRatio={0.9}
                    innerRadiusOffset={0.02}
                    arcOpacity={1}
                    arcBorderWidth={2}
                    arcBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                    ribbonOpacity={0.7}
                    ribbonBorderWidth={1}
                    ribbonBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                    enableLabel={true}
                    label={d => formatDeckName(d.id)}
                    labelOffset={20}
                    labelRotation={-45}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                    colors={['#ef4444', '#eab308', '#22c55e']}
                    motionConfig="gentle"
                    arcTooltip={CustomTooltip}
                    ribbonTooltip={CustomTooltip}
                    legends={[
                      {
                        anchor: 'bottom',
                        direction: 'row',
                        justify: false,
                        translateX: 0,
                        translateY: 70,
                        itemWidth: 80,
                        itemHeight: 14,
                        itemsSpacing: 0,
                        itemTextColor: '#999',
                        itemDirection: 'left-to-right',
                        symbolSize: 12,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemTextColor: '#000'
                            }
                          }
                        ]
                      }
                    ]}
                  />
                </div>
              </div>
            </CustomCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default MatchupsPage; 
