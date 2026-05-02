import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/contexts/ThemeContext';
import DonationCard from '@/components/DonationCard';
import StatCard from '@/components/StatCard';
import { DONATIONS, STATS } from '@/constants/mockData';

export default function HomeScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const recentDonations = DONATIONS.slice(0, 3);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 32 + (Platform.OS === 'web' ? 34 : 0) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <LinearGradient
        colors={isDark ? ['#1A2E1E', '#0F1A12'] : ['#2D5638', '#3D6B4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: topInset + 16 }]}
      >
        {/* Top bar: logo + brand + dark mode toggle */}
        <View style={styles.heroTop}>
          <View style={styles.brandRow}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('@/assets/images/icon.png')}
                style={styles.logoImg}
                resizeMode="cover"
              />
            </View>
            <View>
              <Text style={styles.brandName}>HungerBlock</Text>
              <Text style={styles.brandTagline}>Web3 Food Redistribution</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
            onPress={() => { Haptics.selectionAsync(); toggleTheme(); }}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Headline */}
        <View style={styles.heroBody}>
          <Text style={styles.heroHeadline}>End Food Waste.</Text>
          <Text style={[styles.heroHeadline, styles.heroHeadlineAccent]}>Fight Hunger.</Text>
          <Text style={styles.heroSub}>
            Every donation is verified on-chain and rewarded with HBK tokens.
          </Text>
        </View>

        {/* Chain badge */}
        <View style={styles.chainBadge}>
          <View style={styles.chainDot} />
          <Text style={styles.chainText}>Live on Ethereum · Polygon</Text>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={[styles.actionRow, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.actionPrimary, { backgroundColor: colors.primary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/donate'); }}
          activeOpacity={0.85}
        >
          <Ionicons name="leaf" size={20} color="#fff" />
          <Text style={styles.actionPrimaryLabel}>Donate Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionSecondary, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/request'); }}
          activeOpacity={0.85}
        >
          <Ionicons name="hand-left" size={20} color={colors.primary} />
          <Text style={[styles.actionSecondaryLabel, { color: colors.primary }]}>Request Food</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Global Impact</Text>
        <View style={styles.statsRow}>
          <StatCard icon="heart" label="Donations" value={STATS.totalDonations} color={colors.primary} />
          <StatCard icon="restaurant" label="Meals Served" value={STATS.mealsServed} color={colors.primary} />
        </View>
        <View style={[styles.statsRow, { marginTop: 10 }]}>
          <StatCard icon="people" label="Active NGOs" value={STATS.activeNGOs} color="#3D7BBD" />
          <StatCard icon="logo-bitcoin" label="HBK Tokens" value={STATS.tokensDistributed} color={colors.tokenGold} />
        </View>
      </View>

      {/* Recent Donations */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Donations</Text>
          <TouchableOpacity onPress={() => router.push('/donations')} activeOpacity={0.7}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {recentDonations.map(d => (
          <DonationCard key={d.id} donation={d} onPress={() => {}} />
        ))}
      </View>

      {/* Urgent Banner */}
      <View style={styles.section}>
        <TouchableOpacity onPress={() => router.push('/requests')} activeOpacity={0.9}>
          <View style={[styles.urgentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.urgentIcon, { backgroundColor: colors.urgent + '18' }]}>
              <Ionicons name="warning" size={22} color={colors.urgent} />
            </View>
            <View style={styles.urgentText}>
              <Text style={[styles.urgentTitle, { color: colors.foreground }]}>2 Critical Requests</Text>
              <Text style={[styles.urgentSub, { color: colors.mutedForeground }]}>NGOs need food urgently today</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2D5638',
  },
  logoImg: {
    width: 40,
    height: 40,
  },
  brandName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    lineHeight: 20,
  },
  brandTagline: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'DMSans_400Regular',
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBody: {
    gap: 4,
  },
  heroHeadline: {
    fontSize: 34,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    fontFamily: 'DMSans_700Bold',
    lineHeight: 40,
  },
  heroHeadlineAccent: {
    color: '#A8D5B0',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    fontFamily: 'DMSans_400Regular',
    lineHeight: 21,
    marginTop: 6,
    maxWidth: 300,
  },
  chainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  chainDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#A8D5B0',
  },
  chainText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'DMSans_500Medium',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  actionPrimaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
  },
  actionSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  actionSecondaryLabel: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  urgentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  urgentIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urgentText: { flex: 1 },
  urgentTitle: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  urgentSub: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 2,
  },
});
