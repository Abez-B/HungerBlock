import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color?: string;
}

export default function StatCard({ icon, label, value, suffix = '', prefix = '', color }: StatCardProps) {
  const colors = useColors();
  const animValue = useRef(new Animated.Value(0)).current;
  const iconColor = color || colors.primary;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  return (
    <View style={[styles.card, {
      backgroundColor: colors.card,
      borderColor: colors.border,
      shadowColor: colors.shadow,
    }]}>
      <View style={[styles.iconContainer, { backgroundColor: iconColor + '18' }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <Animated.Text style={[styles.value, { color: colors.foreground }]}>
        {prefix}
        <Animated.Text>
          {animValue.interpolate({
            inputRange: [0, value],
            outputRange: ['0', value.toLocaleString()],
          }) as any}
        </Animated.Text>
        {suffix}
      </Animated.Text>
      <Text style={[styles.label, { color: colors.mutedForeground }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
  },
});
