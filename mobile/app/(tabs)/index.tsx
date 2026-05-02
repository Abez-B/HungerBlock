import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import DonationCard from '@/components/DonationCard';
import StatCard from '@/components/StatCard';
import { DONATIONS, STATS } from '@/constants/mockData';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const recentDonations = DONATIONS.slice(0, 3);

  const handleDonate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/donate');
  };

  const handleRequest = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/request');
  };

  const webTopInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 24 + (Platform.OS === 'web' ? 34 : 0) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Header */}
      <LinearGradient
        colors={['#047A52', '#0A9C68', '#12C07E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: webTopInset + 20 }]}
      >
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroGreeting}>Welcome back</Text>
            <Text style={styles.heroTitle}>HungerBlock</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <Text style={styles.heroSubtitle}>
          Connecting surplus food with those who need it most
        </Text>

        <View style={styles.heroBadge}>
          <Ionicons name="shield-checkmark" size={14} color="#12C07E" />
          <Text style={styles.heroBadgeText}>Powered by Ethereum Blockchain</Text>
        </View>
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionPrimary, { shadowColor: colors.shadow }]}
          onPress={handleDonate}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionGradient}
          >
            <Ionicons name="heart" size={22} color="#fff" />
            <Text style={styles.actionPrimaryText}>Donate Food</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.actionSecondary, {
            backgroundColor: colors.card,
            borderColor: colors.primary,
            shadowColor: colors.shadow,
          }]}
          onPress={handleRequest}
          activeOpacity={0.85}
        >
          <Ionicons name="hand-left" size={22} color={colors.primary} />
          <Text style={[styles.actionSecondaryText, { color: colors.primary }]}>Request Food</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Global Impact</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="heart"
            label="Total Donations"
            value={STATS.totalDonations}
            color="#DC2626"
          />
          <StatCard
            icon="restaurant"
            label="Meals Served"
            value={STATS.mealsServed}
            color={colors.primary}
          />
        </View>
        <View style={[styles.statsGrid, { marginTop: 10 }]}>
          <StatCard
            icon="people"
            label="Active NGOs"
            value={STATS.activeNGOs}
            color="#2563EB"
          />
          <StatCard
            icon="logo-bitcoin"
            label="HBK Tokens"
            value={STATS.tokensDistributed}
            color="#D97706"
            suffix=" HBK"
          />
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
        {recentDonations.map((donation) => (
          <DonationCard
            key={donation.id}
            donation={donation}
            onPress={() => {}}
          />
        ))}
      </View>

      {/* Urgent Requests Banner */}
      <View style={styles.section}>
        <TouchableOpacity
          onPress={() => router.push('/requests')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#DC2626', '#B91C1C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.urgentBanner}
          >
            <View style={styles.urgentLeft}>
              <Ionicons name="warning" size={20} color="#FEF2F2" />
              <View>
                <Text style={styles.urgentTitle}>2 Critical Requests</Text>
                <Text style={styles.urgentSub}>NGOs need food urgently</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#FEF2F2" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroGreeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Inter_400Regular',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    fontFamily: 'Inter_700Bold',
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F5891A',
    borderWidth: 1.5,
    borderColor: '#047A52',
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    maxWidth: 280,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  heroBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Inter_500Medium',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: -16,
    marginBottom: 4,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  actionPrimary: {},
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  actionPrimaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  actionSecondary: {
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  actionSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
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
    fontFamily: 'Inter_700Bold',
    marginBottom: 14,
  },
  seeAll: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
  },
  urgentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  urgentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FEF2F2',
    fontFamily: 'Inter_700Bold',
  },
  urgentSub: {
    fontSize: 12,
    color: 'rgba(254,242,242,0.8)',
    fontFamily: 'Inter_400Regular',
  },
});
