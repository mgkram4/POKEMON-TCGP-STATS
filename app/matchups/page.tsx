"use client"

import { ResponsiveChord } from '@nivo/chord';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaCrown } from 'react-icons/fa';
import { CustomCard } from '../components/card';

import { calculateDeckStats } from '../utils/statsCalculator';

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
  const [, setDecks] = useState<string[]>([]);

  useEffect(() => {
    const processCSVData = async () => {
      const response = await fetch('/trainerhill-meta-matchups-2025-01-21.csv');
      const text = await response.text();
      const rows = text.split('\n').slice(1);
      
      const processedData: MatchupData[] = rows
        .map(row => {
          const [deck1, deck2,,,, total, winRate] = row.split(',');
          if (!deck1 || !deck2 || !winRate) return null;
          
          return {
            deck1,
            deck2,
            winRate: parseFloat(winRate),
            totalGames: parseInt(total)
          };
        })
        .filter((data): data is MatchupData => data !== null);

      // Use the shared stats calculator
      const deckStats = calculateDeckStats(text);
      const validDecks = new Set(deckStats.map(d => d.name));
      
      // Filter matchups to only include decks in our stats
      const validMatchups = processedData.filter(
        m => validDecks.has(m.deck1) && validDecks.has(m.deck2)
      );

      setDecks(Array.from(validDecks));
      setMatchupData(validMatchups);
    };

    processCSVData();
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
              <div className="h-[800px] md:h-[800px] relative">
                <ResponsiveChord
                  data={processChordData().matrix}
                  keys={processChordData().keys}
                  margin={{ 
                    top: 60,  // Reduced top margin
                    right: 20, 
                    bottom: 20,
                    left: 20 
                  }}
                  valueFormat=".1f"
                  padAngle={0.02}
                  innerRadiusRatio={0.96}
                  innerRadiusOffset={0.02}
                  arcOpacity={0.9}
                  arcBorderWidth={1}
                  arcBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                  ribbonOpacity={0.5}
                  ribbonBorderWidth={0.5}
                  ribbonBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                  enableLabel={typeof window !== 'undefined' && window.innerWidth >= 768}
                  label={d => formatDeckName(d.id)}
                  labelOffset={12}
                  labelRotation={-30}
                  labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                />
              </div>
            </CustomCard>
          </motion.div>
        </div>

   
      </motion.div>
    </div>
  );
};

export default MatchupsPage; 
