import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

export const Icon = RawIonicons as unknown as React.ComponentType<IconProps>;

export default Icon;
