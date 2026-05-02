import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ColorScheme } from '@/constants/colors';

export function useColors(): ColorScheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkColors : lightColors;
}
