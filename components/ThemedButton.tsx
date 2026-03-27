import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/Colors';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function ThemedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  style,
  textStyle,
  icon,
}: ThemedButtonProps) {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    switch (variant) {
      case 'primary':   baseStyle.push(styles.buttonPrimary); break;
      case 'secondary': baseStyle.push(styles.buttonSecondary); break;
      case 'tertiary':  baseStyle.push(styles.buttonTertiary); break;
      case 'warning':   baseStyle.push(styles.buttonWarning); break;
      case 'danger':    baseStyle.push(styles.buttonDanger); break;
      case 'outline':   baseStyle.push(styles.buttonOutline); break;
    }

    switch (size) {
      case 'small': baseStyle.push(styles.buttonSmall); break;
      case 'large': baseStyle.push(styles.buttonLarge); break;
      default:      baseStyle.push(styles.buttonMedium);
    }

    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle[] = [styles.buttonText];
    if (variant === 'outline') base.push(styles.buttonTextOutline);
    if (disabled) base.push(styles.buttonTextDisabled);
    return base;
  };

  return (
    <Pressable
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255, 255, 255, 0.1)' }}
    >
      {icon && <>{icon}</>}
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  buttonMedium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    minHeight: 44,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary.purple,
  },
  buttonSecondary: {
    backgroundColor: Colors.primary.green,
  },
  buttonTertiary: {
    backgroundColor: Colors.primary.blue,
  },
  buttonWarning: {
    backgroundColor: Colors.primary.yellow,
  },
  buttonDanger: {
    backgroundColor: Colors.primary.red,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary.purple,
  },
  buttonDisabled: {
    backgroundColor: Colors.dark.border,
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text.primary,
  },
  buttonTextOutline: {
    color: Colors.primary.purple,
  },
  buttonTextDisabled: {
    color: Colors.dark.text.muted,
  },
});
