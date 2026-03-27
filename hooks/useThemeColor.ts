/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
): string {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }

  const value = Colors[theme][colorName];
  if (typeof value === 'string') {
    return value;
  }
  // Nested text objects: return the primary colour
  if (typeof value === 'object' && value !== null && 'primary' in value) {
    return (value as { primary: string }).primary;
  }
  return '#FFFFFF';
}
