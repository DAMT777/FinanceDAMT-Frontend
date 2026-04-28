export interface CategoryDisplay {
  emoji: string;
  color: string;
}

export const categoryIconMap: Record<string, CategoryDisplay> = {
  // Income
  Salary:         { emoji: "💼", color: "#00D68F" },
  Freelance:      { emoji: "💻", color: "#00B4D8" },
  Investment:     { emoji: "📈", color: "#6C63FF" },
  "Other income": { emoji: "💰", color: "#00D68F" },
  Bonus:          { emoji: "🎁", color: "#00D68F" },
  Rental:         { emoji: "🏠", color: "#4ECDC4" },

  // Expense
  Food:           { emoji: "🍔", color: "#FF6B6B" },
  Transport:      { emoji: "🚗", color: "#4ECDC4" },
  Housing:        { emoji: "🏠", color: "#FFE66D" },
  Health:         { emoji: "💊", color: "#FF6B9D" },
  Entertainment:  { emoji: "🎮", color: "#A8E6CF" },
  Education:      { emoji: "📚", color: "#6C63FF" },
  Clothing:       { emoji: "👗", color: "#FF8B94" },
  Subscriptions:  { emoji: "📱", color: "#3ECFF8" },
  Groceries:      { emoji: "🛒", color: "#FFB830" },
  Utilities:      { emoji: "💡", color: "#FFE66D" },
  Travel:         { emoji: "✈️", color: "#00B4D8" },
  Personal:       { emoji: "💆", color: "#A78BFA" },
  Pets:           { emoji: "🐕", color: "#F59E0B" },
  Gifts:          { emoji: "🎁", color: "#EC4899" },
  "Other expense":{ emoji: "💳", color: "#8080AA" },
};

const FALLBACK_COLORS = [
  "#FF6B6B", "#4ECDC4", "#FFE66D", "#6C63FF",
  "#FF6B9D", "#A8E6CF", "#00B4D8", "#FFB830",
];

function hashColor(name: string): string {
  let hash = 0;
  for (const ch of name) hash = (ch.charCodeAt(0) + hash * 31) | 0;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export function getCategoryDisplay(name: string, apiColor?: string): CategoryDisplay {
  const mapped = categoryIconMap[name];
  if (mapped) return mapped;
  return { emoji: "💳", color: apiColor ?? hashColor(name) };
}
