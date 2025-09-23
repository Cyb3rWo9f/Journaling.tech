export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: 'happy' | 'joyful' | 'grateful' | 'excited' | 'energetic' | 'inspired' | 'peaceful' | 'content' | 'motivated' | 'relaxed' | 'creative' | 'focused' | 'neutral' | 'tired' | 'stressed' | 'anxious' | 'melancholy' | 'sad' | 'frustrated' | 'overwhelmed';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface WeeklySummary {
  id: string;
  weekStart: string;
  weekEnd: string;
  entriesAnalyzed: number;
  themes: string[];
  emotionalPatterns: EmotionalPattern[];
  achievements: string[];
  improvements: string[];
  suggestions: string[];
  motivationalInsight: string;
  actionSteps: string[];
  createdAt: string;
}

export interface EntrySummary {
  id: string;
  entryId: string;
  keyThemes: string[];
  emotionalInsights: string[];
  personalGrowth: string[];
  patterns: string[];
  suggestions: string[];
  motivationalNote: string;
  reflection: string;
  createdAt: string;
}

export interface EmotionalPattern {
  emotion: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  context?: string;
}

export interface Theme {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    autoSave: boolean;
    weeklyAnalysis: boolean;
    reminderTime?: string;
  };
  createdAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  location?: string;
  avatar?: string;
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
  joinedDate: string;
  lastEntryDate?: string;
  achievements: string[]; // Array of achievement IDs
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'writing' | 'streak' | 'milestone' | 'special';
  requirement: {
    type: 'entries_count' | 'streak_days' | 'consecutive_days' | 'word_count' | 'special';
    value: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastEntryDate?: string;
  streakStartDate?: string;
}