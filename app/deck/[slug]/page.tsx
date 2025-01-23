"use client"

import { CustomCard } from '@/app/components/card';
import DeckPerformance from '@/app/components/DeckPerformance';
import { deckData } from '@/app/data/decks';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaBolt, FaBrain, FaFire, FaWater } from 'react-icons/fa';

interface PokemonData {
  sprites: {
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    type: {
      name: string;
    };
  }[];
  height: number;
  weight: number;
  stats: {
    base_stat: number;
    stat: {
      name: string;
    };
  }[];
}

const typeColors = {
  psychic: 'from-purple-500 to-purple-700',
  water: 'from-blue-500 to-blue-700',
  electric: 'from-yellow-400 to-yellow-600',
  fire: 'from-orange-500 to-orange-700',
  grass: 'from-green-500 to-green-700',
  normal: 'from-gray-500 to-gray-700',
};

const typeIcons = {
  psychic: FaBrain,
  water: FaWater,
  electric: FaBolt,
  fire: FaFire,
};

const DeckPage = () => {
  const params = useParams();
  const { slug } = params;
  const deck = deckData[slug as string];
  const [pokemonData, setPokemonData] = useState<PokemonData | null>(null);
  // const isLoading = ...

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const pokemonName = deck.name.split('-')[0].toLowerCase();
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
        const data = await response.json();
        setPokemonData(data);
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
      }
    };

    if (deck) {
      fetchPokemonData();
    }
  }, [deck]);

  if (!deck) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Deck not found</h1>
        </div>
      </div>
    );
  }

  const mainType = pokemonData?.types[0]?.type.name || 'normal';
  const TypeIcon = typeIcons[mainType as keyof typeof typeIcons] || FaBrain;

  return (
    <div className={`min-h-screen p-6 bg-gradient-to-br from-${mainType}-50 to-${mainType}-100`}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${typeColors[mainType as keyof typeof typeColors]} p-8 text-white`}
        >
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <TypeIcon className="text-3xl" />
                <h1 className="text-4xl font-bold">{deck.name}</h1>
              </div>
              <p className="max-w-2xl text-lg opacity-90">{deck.description}</p>
            </div>
            {pokemonData && (
              <motion.img
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                src={pokemonData.sprites.other['official-artwork'].front_default}
                alt={deck.name}
                className="w-64 h-64 object-contain"
              />
            )}
          </div>
        </motion.div>

       
     

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strategy Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CustomCard title="Strategy Guide" className="bg-white/80 backdrop-blur-sm h-full">
              <p className="text-gray-700 leading-relaxed">{deck.strategy}</p>
            </CustomCard>
          </motion.div>

          {/* Deck Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DeckPerformance
              winRate="53.5"
              metaShare="25.0"
              totalGames={15000}
              favorableMatchups={7}
            />
          </motion.div>

          {/* Key Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CustomCard title="Key Cards" className="bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                {deck.keyCards.map((card) => (
                  <div key={card.name} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{card.name}</span>
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">×{card.count}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{card.description}</p>
                  </div>
                ))}
              </div>
            </CustomCard>
          </motion.div>

          {/* Matchups */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CustomCard title="Key Matchups" className="bg-white/80 backdrop-blur-sm">
              <div className="space-y-4">
                {deck.matchups.map((matchup) => (
                  <div key={matchup.against} className="border-b border-gray-200 pb-3 last:border-0">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-lg">{matchup.against}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        matchup.favorability === 'Favorable' ? 'bg-green-100 text-green-700' :
                        matchup.favorability === 'Unfavorable' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {matchup.favorability}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{matchup.notes}</p>
                  </div>
                ))}
              </div>
            </CustomCard>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeckPage;