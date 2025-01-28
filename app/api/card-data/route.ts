import { NextResponse } from 'next/server';

export async function GET() {
  const hardcodedCards = [
    {
      cardNumber: "A1 001",
      name: "Bulbasaur",
      rarity: "◇",
      type: "Mewtwo",
      hp: 70,
      stage: "Basic",
      points: 35
    },
    {
      cardNumber: "A1 002",
      name: "Ivysaur",
      rarity: "◇◇",
      type: "Mewtwo",
      hp: 90,
      stage: "Stage 1",
      points: 70
    },
    {
      cardNumber: "A1 003",
      name: "Venusaur",
      rarity: "◇◇◇",
      type: "Mewtwo",
      hp: 160,
      stage: "Stage 2",
      points: 150
    },
    {
      cardNumber: "A1 033",
      name: "Charmander",
      rarity: "◇",
      type: "Charizard",
      hp: 60,
      stage: "Basic",
      points: 35
    },
    {
      cardNumber: "A1 034",
      name: "Charmeleon",
      rarity: "◇◇",
      type: "Charizard",
      hp: 90,
      stage: "Stage 1",
      points: 70
    },
    {
      cardNumber: "A1 035",
      name: "Charizard",
      rarity: "◇◇◇",
      type: "Charizard",
      hp: 150,
      stage: "Stage 2",
      points: 150
    },
    {
      cardNumber: "A1 094",
      name: "Pikachu",
      rarity: "◇",
      type: "Pikachu",
      hp: 60,
      stage: "Basic",
      points: 35
    },
    {
      cardNumber: "A1 095",
      name: "Raichu",
      rarity: "◇◇◇",
      type: "Pikachu",
      hp: 100,
      stage: "Stage 1",
      points: 150
    },
    {
      cardNumber: "A1 128",
      name: "Mewtwo",
      rarity: "◇◇◇",
      type: "Mewtwo",
      hp: 120,
      stage: "Basic",
      points: 150
    }
  ];

  return NextResponse.json(hardcodedCards);
} 