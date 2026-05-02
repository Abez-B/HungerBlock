import { lightColors, darkColors, ColorScheme } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

export function useColors(): ColorScheme {
  const { isDark } = useTheme();
  return isDark ? darkColors : lightColors;
}
