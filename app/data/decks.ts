export interface DeckData {
  name: string;
  description: string;
  strategy: string;
  keyCards: {
    name: string;
    count: number;
    description: string;
  }[];
  matchups: {
    against: string;
    favorability: 'Favorable' | 'Even' | 'Unfavorable';
    notes: string;
  }[];
  stats: {
    winRate: string;
    metaShare: string;
    totalGames: number;
    favorableMatchups: number;
    performanceScore: string;
  };
}

export const deckData: Record<string, DeckData> = {
  'mewtwo-ex': {
    name: 'Mewtwo-EX',
    description: 'A dominant psychic-type deck that combines raw power with strategic disruption. Mewtwo-EX\'s ability to punish energy-heavy decks makes it a formidable force in the current meta.',
    strategy: 'The deck focuses on early game pressure while setting up multiple Mewtwo-EX. Use energy acceleration to power up devastating attacks quickly. Save your Marnie and Boss\'s Orders for crucial moments to disrupt opponent\'s key plays. Against aggressive decks, focus on energy management and calculated trades.',
    keyCards: [
      {
        name: 'Mewtwo-EX',
        count: 4,
        description: 'Main attacker with Psychic Infinity attack that scales with energy count'
      },
      {
        name: 'Double Colorless Energy',
        count: 4,
        description: 'Essential for powering up Mewtwo-EX quickly and efficiently'
      },
      {
        name: 'Marnie',
        count: 3,
        description: 'Disrupts opponent\'s hand while providing card draw'
      },
      {
        name: 'Boss\'s Orders',
        count: 2,
        description: 'Target key threats or weak benched Pokémon'
      },
      {
        name: 'Quick Ball',
        count: 4,
        description: 'Searches for Pokémon while thinning deck'
      }
    ],
    matchups: [],
    stats: {
      winRate: "47.8",
      metaShare: "52.4",
      totalGames: 40698,
      favorableMatchups: 7,
      performanceScore: "58.8"
    }
  },
  'gyarados-ex': {
    name: 'Gyarados-EX',
    description: 'A powerful water-type deck that combines consistent damage output with impressive energy acceleration. Known for its ability to stream attackers efficiently and apply constant pressure.',
    strategy: 'Focus on setting up multiple Gyarados-EX while using support Pokémon to accelerate energy attachment. Use Melony to power up attackers quickly and maintain pressure. Save switching cards for crucial pivot moments and to preserve energy resources.',
    keyCards: [
      {
        name: 'Gyarados-EX',
        count: 4,
        description: 'Main attacker with devastating water-type attacks'
      },
      {
        name: 'Melony',
        count: 4,
        description: 'Crucial supporter for energy acceleration'
      },
      {
        name: 'Capacious Bucket',
        count: 3,
        description: 'Searches for Water Energy to fuel Melony'
      },
      {
        name: 'Air Balloon',
        count: 2,
        description: 'Provides crucial mobility for attackers'
      },
      {
        name: 'Water Energy',
        count: 12,
        description: 'Basic energy for powering attacks and Melony'
      }
    ],
    matchups: [],
    stats: {
      winRate: "48.6",
      metaShare: "37.8",
      totalGames: 29388,
      favorableMatchups: 7,
      performanceScore: "54.8"
    }
  },
  'pikachu-ex': {
    name: 'Pikachu-EX',
    description: 'A fast-paced electric-type deck that excels at dealing consistent damage through bench utilization. Known for setting the pace of the metagame with its Circle Circuit attack that can deal up to 90 damage with just two energies.',
    strategy: 'Fill your bench with Electric-type Pokémon to maximize Circle Circuit damage output. Focus on early game pressure while managing your bench count. Use support Pokémon like Dedenne for paralysis control or Electabuzz for targeted damage. Save switching cards to protect damaged Pikachu-EX.',
    keyCards: [
      {
        name: 'Pikachu-EX',
        count: 4,
        description: 'Main attacker with Circle Circuit dealing 30 damage × benched Pokémon count'
      },
      {
        name: 'Zapdos-EX',
        count: 2,
        description: 'Secondary attacker capable of dealing with bulkier Pokémon'
      },
      {
        name: 'Dedenne',
        count: 2,
        description: 'Tech card that can inflict paralysis for tempo control'
      },
      {
        name: 'Electric Energy',
        count: 12,
        description: 'Basic energy for powering attacks'
      },
      {
        name: 'X Speed',
        count: 3,
        description: 'Crucial for mobility and protecting damaged Pikachu-EX'
      }
    ],
    matchups: [],
    stats: {
      winRate: "52.3",
      metaShare: "38.5",
      totalGames: 25432,
      favorableMatchups: 6,
      performanceScore: "56.4"
    }
  },
  'exeggutor-ex': {
    name: 'Exeggutor-EX',
    description: 'A control-oriented deck that specializes in energy denial and disruption strategies. Known for its ability to lock opponents out of the game through resource management.',
    strategy: 'Focus on denying opponent\'s energy attachments while building up your own board state. Use support cards to maintain hand advantage and control the pace of the game.',
    keyCards: [
      {
        name: 'Exeggutor-EX',
        count: 4,
        description: 'Main attacker with powerful energy denial capabilities'
      },
      {
        name: 'Enhanced Hammer',
        count: 4,
        description: 'Removes special energy from opponent\'s Pokémon'
      },
      {
        name: 'Team Yell Grunt',
        count: 3,
        description: 'Supporter that removes energy from opponent\'s active Pokémon'
      },
      {
        name: 'Path to the Peak',
        count: 3,
        description: 'Stadium that shuts down Pokémon-EX abilities'
      },
      {
        name: 'Grass Energy',
        count: 10,
        description: 'Basic energy for powering attacks'
      }
    ],
    matchups: [],
    stats: {
      winRate: "48.8",
      metaShare: "16.6",
      totalGames: 12924,
      favorableMatchups: 8,
      performanceScore: "57.2"
    }
  },
  'aerodactyl-ex': {
    name: 'Aerodactyl-EX',
    description: 'A versatile fighting-type deck that excels at targeting EX Pokémon and applying consistent pressure through its unique attacks.',
    strategy: 'Set up multiple Aerodactyl-EX while using support Pokémon to maintain board control. Focus on targeting opponent\'s EX Pokémon for efficient prize trades.',
    keyCards: [
      {
        name: 'Aerodactyl-EX',
        count: 4,
        description: 'Main attacker with bonus damage against EX Pokémon'
      },
      {
        name: 'Fighting Energy',
        count: 12,
        description: 'Basic energy for powering attacks'
      }
    ],
    matchups: [],
    stats: {
      winRate: "46.7",
      metaShare: "8.6",
      totalGames: 6666,
      favorableMatchups: 7,
      performanceScore: "52.4"
    }
  },
  'celebi-ex': {
    name: 'Celebi-EX',
    description: 'A technical grass-type deck that utilizes time-based mechanics and unique ability combinations.',
    strategy: 'Use Celebi-EX\'s ability to set up powerful combinations while maintaining board control. Focus on energy acceleration and strategic prize trades.',
    keyCards: [
      {
        name: 'Celebi-EX',
        count: 4,
        description: 'Main attacker with time-shifting ability'
      },
      {
        name: 'Grass Energy',
        count: 10,
        description: 'Basic energy for powering attacks'
      }
    ],
    matchups: [],
    stats: {
      winRate: "43.3",
      metaShare: "11.6",
      totalGames: 9036,
      favorableMatchups: 6,
      performanceScore: "49.8"
    }
  },
  'charizard-ex-arcanine': {
    name: 'Charizard-EX/Arcanine',
    description: 'A fire-type combination deck that leverages both Charizard-EX\'s raw power and Arcanine\'s support capabilities.',
    strategy: 'Build up energy on Charizard-EX while using Arcanine for support and backup attacks. Maintain pressure through consistent damage output.',
    keyCards: [
      {
        name: 'Charizard-EX',
        count: 3,
        description: 'Primary attacker with high damage output'
      },
      {
        name: 'Arcanine',
        count: 3,
        description: 'Support attacker and setup Pokémon'
      }
    ],
    matchups: [],
    stats: {
      winRate: "49.6",
      metaShare: "7.7",
      totalGames: 6014,
      favorableMatchups: 6,
      performanceScore: "51.2"
    }
  },
  'charizard-ex-moltres': {
    name: 'Charizard-EX/Moltres',
    description: 'A powerful fire-type deck that combines Charizard-EX\'s raw power with Moltres\'s utility and support capabilities.',
    strategy: 'Establish early pressure with Moltres while building up energy on Charizard-EX. Use energy acceleration to power up devastating attacks and maintain board control.',
    keyCards: [
      {
        name: 'Charizard-EX',
        count: 3,
        description: 'Primary attacker with massive damage potential'
      },
      {
        name: 'Moltres',
        count: 3,
        description: 'Secondary attacker and setup support'
      },
      {
        name: 'Fire Energy',
        count: 12,
        description: 'Basic energy for powering attacks'
      },
      {
        name: 'Welder',
        count: 4,
        description: 'Key supporter for energy acceleration'
      }
    ],
    matchups: [],
    stats: {
      winRate: "45.1",
      metaShare: "8.8",
      totalGames: 6876,
      favorableMatchups: 5,
      performanceScore: "50.6"
    }
  },
  'arcanine-ex': {
    name: 'Arcanine-EX',
    description: 'A fast-paced fire-type deck focusing on consistent damage output and mobility.',
    strategy: 'Utilize Arcanine-EX\'s agility to strike key targets while maintaining board presence. Focus on energy efficiency and strategic retreats.',
    keyCards: [
      {
        name: 'Arcanine-EX',
        count: 4,
        description: 'Main attacker with mobility options'
      },
      {
        name: 'Fire Energy',
        count: 10,
        description: 'Basic energy for attacks'
      },
      {
        name: 'Switch',
        count: 4,
        description: 'Essential for mobility strategy'
      }
    ],
    matchups: [],
    stats: {
      winRate: "47.8",
      metaShare: "4.9",
      totalGames: 3810,
      favorableMatchups: 4,
      performanceScore: "49.2"
    }
  },
  'greninja': {
    name: 'Greninja',
    description: 'A technical water-type deck that emphasizes evolution chains and ability-based damage output.',
    strategy: 'Set up multiple Greninja while using their abilities to spread damage. Focus on evolution timing and resource management.',
    keyCards: [
      {
        name: 'Greninja',
        count: 4,
        description: 'Main attacker with ability-based damage'
      },
      {
        name: 'Froakie',
        count: 4,
        description: 'Essential basic Pokémon'
      },
      {
        name: 'Frogadier',
        count: 3,
        description: 'Evolution step with useful ability'
      },
      {
        name: 'Water Energy',
        count: 10,
        description: 'Basic energy for attacks'
      }
    ],
    matchups: [],
    stats: {
      winRate: "46.6",
      metaShare: "4.0",
      totalGames: 3126,
      favorableMatchups: 3,
      performanceScore: "48.4"
    }
  },
  'serperior-exeggutor': {
    name: 'Serperior-Exeggutor',
    description: 'A grass-type combo deck that combines Serperior\'s control elements with Exeggutor\'s disruption capabilities.',
    strategy: 'Control the game pace through ability locks and energy disruption while building up powerful attackers.',
    keyCards: [
      {
        name: 'Serperior',
        count: 3,
        description: 'Main attacker with control abilities'
      },
      {
        name: 'Exeggutor',
        count: 3,
        description: 'Support Pokémon for disruption'
      },
      {
        name: 'Grass Energy',
        count: 11,
        description: 'Basic energy for attacks'
      }
    ],
    matchups: [],
    stats: {
      winRate: "49.3",
      metaShare: "2.9",
      totalGames: 2242,
      favorableMatchups: 1,
      performanceScore: "47.8"
    }
  },
  'golem-druddigon': {
    name: 'Golem-Druddigon',
    description: 'A fighting/dragon-type combination deck focusing on type coverage and raw power.',
    strategy: 'Use Golem for fighting-type coverage while Druddigon handles dragon-weak threats. Maintain energy attachment consistency.',
    keyCards: [
      {
        name: 'Golem',
        count: 3,
        description: 'Fighting-type attacker'
      },
      {
        name: 'Druddigon',
        count: 3,
        description: 'Dragon-type attacker'
      },
      {
        name: 'Fighting Energy',
        count: 8,
        description: 'Basic energy for Golem'
      }
    ],
    matchups: [],
    stats: {
      winRate: "40.3",
      metaShare: "5.4",
      totalGames: 4170,
      favorableMatchups: 1,
      performanceScore: "44.2"
    }
  },
  'scolipede': {
    name: 'Scolipede',
    description: 'A poison-type deck that focuses on status conditions and accumulating damage over time.',
    strategy: 'Apply poison pressure while building up attackers. Use status conditions to control the pace of the game.',
    keyCards: [
      {
        name: 'Scolipede',
        count: 4,
        description: 'Main attacker with poison abilities'
      },
      {
        name: 'Grass Energy',
        count: 10,
        description: 'Basic energy for attacks'
      },
      {
        name: 'Poison Barb',
        count: 4,
        description: 'Tool for additional poison damage'
      }
    ],
    matchups: [],
    stats: {
      winRate: "41.5",
      metaShare: "3.6",
      totalGames: 2792,
      favorableMatchups: 1,
      performanceScore: "45.6"
    }
  }
};