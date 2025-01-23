// Replace these placeholder values with your actual ad unit IDs from AdSense
export const AD_SLOTS = {
  META_OVERVIEW: 'your-meta-overview-ad-unit-id',
  TIER_LIST: 'your-tier-list-ad-unit-id',
  PERFORMANCE_CHARTS: 'your-performance-charts-ad-unit-id',
} as const;

export type AdSlot = keyof typeof AD_SLOTS;

export function getAdSlot(slot: AdSlot): string {
  return AD_SLOTS[slot];
} 