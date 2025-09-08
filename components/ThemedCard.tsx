import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'compact' | 'feature' | 'activity';
  color?: keyof typeof Colors.features;
}

export function ThemedCard({ 
  children, 
  style, 
  variant = 'default',
  color 
}: ThemedCardProps) {
  const getCardStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.cardCompact;
      case 'feature':
        return styles.featureCard;
      case 'activity':
        return styles.activityCard;
      default:
        return styles.card;
    }
  };

  const getColorStyle = () => {
    if (color && variant === 'feature') {
      return {
        borderLeftWidth: 4,
        borderLeftColor: Colors.features[color],
      };
    }
    return {};
  };

  return (
    <View style={[getCardStyle(), getColorStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardCompact: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  featureCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activityCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
});
