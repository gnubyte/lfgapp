import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemedCard } from './ThemedCard';
import { ThemedButton } from './ThemedButton';
import { IconSymbol } from './ui/IconSymbol';
import { Colors } from '@/constants/Colors';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  color: keyof typeof Colors.features;
}

export function FeatureCard({
  icon,
  title,
  description,
  buttonText,
  onPress,
  color,
}: FeatureCardProps) {
  const getButtonVariant = () => {
    switch (color) {
      case 'groups':
        return 'primary' as const;
      case 'events':
        return 'secondary' as const;
      case 'calendar':
        return 'tertiary' as const;
      case 'messages':
        return 'warning' as const;
      default:
        return 'primary' as const;
    }
  };

  return (
    <ThemedCard variant="feature" color={color}>
      <View style={[styles.iconContainer, { backgroundColor: Colors.features[color] }]}>
        <IconSymbol name={icon} size={24} color={Colors.dark.text.primary} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      
      <ThemedButton
        title={buttonText}
        onPress={onPress}
        variant={getButtonVariant()}
        size="small"
        style={styles.button}
      />
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.dark.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  button: {
    minWidth: 120,
  },
});
