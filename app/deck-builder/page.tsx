"use client"

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { CustomCard } from '../components/card';

interface Card {
  cardNumber: string;
  name: string;
  rarity: string;
  type: string;
  hp: number;
  stage: string;
  points: number;
}

interface DeckSuggestion {
  cards: Card[];
  averagePoints: number;
  totalPoints: number;
  typeDistribution: { [key: string]: number };
}

export default function DeckBuilder() {
  const [selectedCards, setSelectedCards] = useState<Card[]>([]);
  const [suggestions, setSuggestions] = useState<DeckSuggestion[]>([]);
  const [cardData, setCardData] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCardData = async () => {
      try {
        const response = await fetch('/api/card-data');
        if (!response.ok) {
          throw new Error('Failed to fetch card data');
        }
        const data = await response.json();
        setCardData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading card data:', error);
        setIsLoading(false);
      }
    };

    loadCardData();
  }, []);

  const generateDeckSuggestions = () => {
    if (!selectedCards.length || !cardData) return;

    const variations: DeckSuggestion[] = [];
    
    for (let i = 0; i < 3; i++) {
      const deck = [...selectedCards];
      const baseType = selectedCards[0].type;
      
      // Filter compatible cards
      const compatibleCards = cardData.filter(card => {
        if (deck.find(d => d.cardNumber === card.cardNumber)) return false;
        
        const isTypeCompatible = 
          card.type === baseType || 
          card.type === 'Any' || 
          baseType === 'Any';

        const hasPrerequisites = card.stage === 'Basic' || 
          (card.stage === 'Stage 1' && deck.some(d => 
            d.stage === 'Basic' && d.name === card.name.split(' ')[0]
          )) ||
          (card.stage === 'Stage 2' && deck.some(d => 
            d.stage === 'Stage 1' && d.name === card.name.split(' ')[0]
          ));

        return isTypeCompatible && hasPrerequisites;
      });

      // Sort by points
      compatibleCards.sort((a, b) => b.points - a.points);

      // Add cards to deck
      while (deck.length < 20 && compatibleCards.length > 0) {
        const card = compatibleCards[0];
        const copiesInDeck = deck.filter(c => c.cardNumber === card.cardNumber).length;
        if (copiesInDeck < 4) {
          deck.push(card);
        }
        compatibleCards.shift();
      }

      const totalPoints = deck.reduce((sum, card) => sum + card.points, 0);
      const typeDistribution = deck.reduce((acc, card) => {
        acc[card.type] = (acc[card.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      variations.push({
        cards: deck,
        averagePoints: totalPoints / deck.length,
        totalPoints,
        typeDistribution
      });
    }

    setSuggestions(variations);
  };

  const handleCardSelect = (card: Card) => {
    if (selectedCards.some(c => c.cardNumber === card.cardNumber)) {
      setSelectedCards(selectedCards.filter(c => c.cardNumber !== card.cardNumber));
    } else if (selectedCards.length < 2) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-blue-50 to-indigo-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        <section className="mb-12">
          <CustomCard title="Available Cards" className="bg-white/50">
            {isLoading ? (
              <div className="p-4 text-center">Loading cards...</div>
            ) : cardData.length === 0 ? (
              <div className="p-4 text-center">No cards available</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
                {cardData.map((card) => (
                  <div
                    key={card.cardNumber}
                    onClick={() => handleCardSelect(card)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedCards.some(c => c.cardNumber === card.cardNumber)
                        ? 'bg-blue-100 shadow-md'
                        : 'bg-white hover:bg-gray-50'
                    } border border-gray-200`}
                  >
                    <div className="text-sm font-medium">{card.name}</div>
                    <div className="text-xs text-gray-600">
                      <div>Type: {card.type}</div>
                      <div>Rarity: {card.rarity}</div>
                      <div>Points: {card.points}</div>
                      {card.stage && <div>Stage: {card.stage}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CustomCard>
        </section>

        <section className="mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent mb-4">
              Deck Builder
            </h1>
            <p className="text-gray-600 mb-6">
              Select up to 2 cards to build your deck around. Well suggest 3 competitive variations.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <CustomCard title="Selected Cards" className="bg-white/50">
                <div className="flex gap-4 flex-wrap min-h-[100px] items-center p-4">
                  {selectedCards.length === 0 ? (
                    <p className="text-gray-500">Select up to 2 cards to begin</p>
                  ) : (
                    selectedCards.map(card => (
                      <div 
                        key={card.cardNumber}
                        className="px-4 py-2 bg-blue-100 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-blue-200"
                        onClick={() => handleCardSelect(card)}
                      >
                        {card.name}
                        <span className="text-sm">×</span>
                      </div>
                    ))
                  )}
                </div>
              </CustomCard>

              <CustomCard title="Actions" className="bg-white/50">
                <div className="p-4">
                  <button
                    onClick={generateDeckSuggestions}
                    disabled={selectedCards.length === 0}
                    className={`w-full px-6 py-3 rounded-lg text-white font-medium ${
                      selectedCards.length === 0 
                        ? 'bg-gray-400' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                    }`}
                  >
                    Generate Deck Suggestions
                  </button>
                </div>
              </CustomCard>
            </div>

            {suggestions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {suggestions.map((suggestion, index) => (
                  <CustomCard 
                    key={index}
                    title={`Variation ${index + 1}`} 
                    className="bg-white/50"
                  >
                    <div className="space-y-4 p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Average Points</span>
                        <span className="text-green-600">{suggestion.averagePoints.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Points</span>
                        <span className="text-blue-600">{suggestion.totalPoints}</span>
                      </div>
                      <div>
                        <span className="text-sm font-medium block mb-2">Type Distribution</span>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(suggestion.typeDistribution).map(([type, count]) => (
                            <span 
                              key={type}
                              className="px-2 py-1 bg-gray-100 rounded text-sm"
                            >
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Cards:</h4>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.cards.map((card) => (
                            <span 
                              key={card.cardNumber}
                              className="px-2 py-1 bg-gray-100 rounded text-sm"
                            >
                              {card.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CustomCard>
                ))}
              </div>
            )}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
