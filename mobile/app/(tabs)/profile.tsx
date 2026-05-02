import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { USER_STATS } from '@/constants/mockData';

interface Achievement {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  earned: boolean;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: '1', icon: 'heart', title: 'First Donor', description: 'Made your first donation', earned: true, color: '#DC2626' },
  { id: '2', icon: 'star', title: 'Food Hero', description: '5 verified donations', earned: true, color: '#D97706' },
  { id: '3', icon: 'trophy', title: 'Champion', description: '10 meals contributed', earned: true, color: '#047A52' },
  { id: '4', icon: 'diamond', title: 'Blockchain Pioneer', description: 'First on-chain donation', earned: false, color: '#7C3AED' },
  { id: '5', icon: 'flame', title: 'Streak Master', description: '7-day donation streak', earned: false, color: '#EA580C' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const handleConnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setConnected(c => !c);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : 0) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile Header */}
      <LinearGradient
        colors={['#047A52', '#0A9C68']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.profileHeader, { paddingTop: topInset + 20 }]}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#047A52" />
          </View>
          {connected && (
            <View style={styles.connectedDot} />
          )}
        </View>
        <Text style={styles.walletLabel}>
          {connected ? '0x1a2b...9c0d' : 'No Wallet Connected'}
        </Text>
        <Text style={styles.walletRole}>
          {connected ? 'Donor • Verified' : 'Connect to start donating'}
        </Text>

        <TouchableOpacity
          style={[styles.connectBtn, {
            backgroundColor: connected ? 'rgba(255,255,255,0.2)' : '#fff',
          }]}
          onPress={handleConnect}
          activeOpacity={0.85}
        >
          <Ionicons
            name={connected ? 'wallet' : 'wallet-outline'}
            size={16}
            color={connected ? '#fff' : '#047A52'}
          />
          <Text style={[styles.connectBtnText, { color: connected ? '#fff' : '#047A52' }]}>
            {connected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats */}
      {connected && (
        <View style={[styles.section, styles.statsRow]}>
          {[
            { label: 'Donations', value: USER_STATS.donationsMade, icon: 'heart' as const },
            { label: 'Meals', value: USER_STATS.mealsContributed, icon: 'restaurant' as const },
            { label: 'HBK Tokens', value: USER_STATS.tokensEarned, icon: 'logo-bitcoin' as const },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={stat.icon} size={18} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map(a => (
            <View
              key={a.id}
              style={[styles.achievementCard, {
                backgroundColor: colors.card,
                borderColor: a.earned ? a.color + '40' : colors.border,
                opacity: a.earned ? 1 : 0.5,
              }]}
            >
              <View style={[styles.achievementIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={20} color={a.earned ? a.color : colors.mutedForeground} />
              </View>
              <Text style={[styles.achievementTitle, { color: colors.foreground }]} numberOfLines={1}>
                {a.title}
              </Text>
              <Text style={[styles.achievementDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                {a.description}
              </Text>
              {a.earned && (
                <View style={[styles.earnedBadge, { backgroundColor: a.color }]}>
                  <Ionicons name="checkmark" size={10} color="#fff" />
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
        <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={v => { setNotifications(v); Haptics.selectionAsync(); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {[
            { icon: 'shield-outline' as const, label: 'Privacy Policy' },
            { icon: 'document-text-outline' as const, label: 'Terms of Service' },
            { icon: 'help-circle-outline' as const, label: 'Help & Support' },
            { icon: 'information-circle-outline' as const, label: 'About HungerBlock' },
          ].map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.settingRow, {
                borderBottomColor: colors.border,
                borderBottomWidth: i < 3 ? 1 : 0,
              }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Version */}
      <Text style={[styles.version, { color: colors.mutedForeground }]}>
        HungerBlock v1.0.0 • Powered by Ethereum
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectedDot: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#047A52',
  },
  walletLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
  walletRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: 'Inter_400Regular',
  },
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  connectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statItem: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
    marginBottom: 14,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    gap: 6,
    position: 'relative',
  },
  achievementIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  achievementDesc: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    lineHeight: 15,
  },
  earnedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
    fontFamily: 'Inter_400Regular',
  },
});
