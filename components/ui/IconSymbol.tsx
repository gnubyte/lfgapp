import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

const MAPPING: Record<string, MaterialIconName> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'person.fill': 'person',
  'person.circle': 'account-circle',
  'person.3.fill': 'groups',
  'lock.fill': 'lock',
  'gamecontroller.fill': 'sports-esports',
  'magnifyingglass': 'search',
  'plus.circle': 'add-circle',
  'calendar': 'event',
  'message': 'chat',
  'video': 'videocam',
  'bell': 'notifications',
  'waveform': 'equalizer',
  'checkmark.circle': 'check-circle-outline',
  'checkmark.circle.fill': 'check-circle',
  'questionmark.circle': 'help-outline',
  'exclamationmark.triangle.fill': 'warning',
  'arrow.right.square': 'logout',
  'gearshape.fill': 'settings',
  'square': 'crop-square',
  'doc.text': 'description',
  'list.bullet': 'format-list-bulleted',
  'plus': 'add',
  'xmark': 'close',
  'heart.fill': 'favorite',
  'heart': 'favorite-border',
  'star.fill': 'star',
  'star': 'star-border',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const materialName = MAPPING[name] ?? 'help-outline';
  return <MaterialIcons color={color} size={size} name={materialName} style={style} />;
}
