# TCG Pocket - Pokemon Trading Card Game Meta Analysis Dashboard

## Overview
TCG Pocket is a comprehensive web application for tracking and analyzing the Pokemon Trading Card Game competitive meta. The dashboard provides real-time statistics, tier rankings, and detailed analytics for different deck archetypes in the current competitive environment.

## Features

### Live Meta Analysis
- Real-time updates of competitive deck statistics
- Tier-based classification system (S through F tiers)
- Comprehensive win rate and meta share tracking
- Performance scoring for each deck archetype

### Interactive Dashboard Components
- **Stats Overview Cards**
  - Total Games Tracked
  - Average Win Rate
  - Top Performing Deck
  - Meta Diversity Statistics

### Visualization Features
- Interactive tier list with detailed deck statistics
- Win rate distribution charts
- Meta share analysis graphs
- Pokemon sprite integration with PokeAPI

### Deck Details
Each deck entry includes:
- Win rate percentage
- Meta share percentage
- Total games played
- Number of favorable matchups
- Performance score
- Visual representation with corresponding Pokemon sprites

## Technical Implementation

### Core Technologies
- Next.js (React Framework)
- TypeScript
- Tailwind CSS
- Framer Motion for animations
- Recharts for data visualization

### API Integrations
- PokeAPI for Pokemon sprites and data
- Internal API endpoints for meta statistics
  - `/api/meta-data` for deck statistics
  - Dynamic routing for individual deck pages

### Design System
#### Color Scheme
World Championships-inspired color palette:
- S Tier: #E3350D (Championship Red)
- A Tier: #0055B7 (Championship Blue)
- B Tier: #00A058 (Championship Green)
- C Tier: #FDD23C (Championship Yellow)
- D Tier: #A65D9E (Purple)
- F Tier: #919191 (Silver)

### Key Components
1. **TierCard**
   - Individual deck display
   - Pokemon sprite integration
   - Interactive hover effects
   - Dynamic stat display

2. **TierList**
   - Grouped deck displays by tier
   - Responsive grid layout
   - Animated transitions

3. **CustomCard**
   - Reusable component for stat displays
   - Gradient backgrounds
   - Icon integration

4. **Charts**
   - Win rate distribution
   - Meta share analysis
   - Interactive tooltips
   - Responsive design

## Performance Optimizations
- Image optimization with Next.js Image component
- Lazy loading of Pokemon sprites
- Responsive design for all screen sizes
- Loading skeleton states for better UX
- Client-side data caching

## Usage
The dashboard automatically updates with the latest meta statistics. Users can:
1. View overall meta statistics
2. Browse deck tiers
3. Analyze individual deck performance
4. Track meta trends through interactive charts
5. Access detailed deck information through dynamic routing

## Data Structure
```typescript
interface DeckStats {
  deck: string;
  winRate: string;
  metaShare: string;
  totalGames: number;
  favorableMatchups: number;
  performanceScore: string;
}
```

## Contributing
The project uses TypeScript for type safety and maintainability. All contributions should follow the established type system and component structure.

## License
© 2025 Pokemon TCG World Championships. All Pokemon-related content belongs to Nintendo & The Pokemon Company.
