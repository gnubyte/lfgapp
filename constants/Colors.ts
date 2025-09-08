/**
 * Color scheme matching the LFG web dashboard
 */

export const Colors = {
  // Primary Brand Colors
  primary: {
    purple: '#8B5CF6',
    green: '#10B981', 
    blue: '#3B82F6',
    yellow: '#F59E0B',
    orange: '#F97316',
    red: '#EF4444',
  },

  // Dark Theme Colors
  dark: {
    background: '#0F0F23',
    surface: '#1A1A2E',
    card: '#16213E',
    border: '#2D3748',
    text: {
      primary: '#FFFFFF',
      secondary: '#A0AEC0',
      muted: '#718096',
    },
  },

  // Light Theme Colors
  light: {
    background: '#FFFFFF',
    surface: '#F7FAFC',
    card: '#FFFFFF',
    border: '#E2E8F0',
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      muted: '#718096',
    },
  },

  // Status Colors
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Feature Colors (matching dashboard)
  features: {
    groups: '#8B5CF6',      // Purple
    events: '#10B981',       // Green
    calendar: '#3B82F6',     // Blue
    messages: '#F59E0B',     // Yellow
    profile: '#F97316',      // Orange
    timeline: '#EF4444',     // Red
  },

  // Activity Colors
  activity: {
    groupsJoined: '#8B5CF6',
    eventsRSVP: '#10B981',
    upcomingEvents: '#3B82F6',
  },

  // Interactive States
  interactive: {
    hover: 'rgba(255, 255, 255, 0.1)',
    pressed: 'rgba(255, 255, 255, 0.2)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
};

export const getThemeColors = (isDark: boolean) => {
  return {
    ...Colors,
    background: isDark ? Colors.dark.background : Colors.light.background,
    surface: isDark ? Colors.dark.surface : Colors.light.surface,
    card: isDark ? Colors.dark.card : Colors.light.card,
    border: isDark ? Colors.dark.border : Colors.light.border,
    text: isDark ? Colors.dark.text : Colors.light.text,
  };
};