// Suit colors — docs/PROJECT_PLAN.md §8.3. A suit is a color swap on one Astronaut SVG.
export type SuitId = 'classic' | 'mars' | 'ocean' | 'galaxy'
export type Suit = { suit: string; rim: string; accent: string; cost: number }

export const suits: Record<SuitId, Suit> = {
  classic: { suit: '#E8ECF5', rim: '#FFC93C', accent: '#2EC4B6', cost: 0 },
  mars: { suit: '#E0703A', rim: '#B5482A', accent: '#FFC93C', cost: 0 },
  ocean: { suit: '#2EC4B6', rim: '#1B2F5E', accent: '#FFF8E7', cost: 30 },
  galaxy: { suit: '#8B6CF0', rim: '#FF8FB1', accent: '#FFC93C', cost: 50 },
}
