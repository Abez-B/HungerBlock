import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Switch, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/contexts/ThemeContext';
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
  { id: '1', icon: 'leaf', title: 'First Donor', description: 'Made your first donation', earned: true, color: '#2D7A4A' },
  { id: '2', icon: 'star', title: 'Food Hero', description: '5 verified donations', earned: true, color: '#B7770D' },
  { id: '3', icon: 'trophy', title: 'Champion', description: '10 meals contributed', earned: true, color: '#2D5638' },
  { id: '4', icon: 'diamond', title: 'Chain Pioneer', description: 'First on-chain donation', earned: false, color: '#6741D9' },
  { id: '5', icon: 'flame', title: 'Streak Master', description: '7-day donation streak', earned: false, color: '#C0392B' },
];

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 + (Platform.OS === 'web' ? 34 : 0) }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1A2E1E', '#0F1A12'] : ['#2D5638', '#3D6B4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.profileHeader, { paddingTop: topInset + 16 }]}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoWrapper}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logoImg} resizeMode="cover" />
            </View>
            <Text style={styles.brandName}>HungerBlock</Text>
          </View>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
            onPress={() => { Haptics.selectionAsync(); toggleTheme(); }}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Ionicons name="person" size={36} color="rgba(255,255,255,0.9)" />
            </View>
            {connected && <View style={styles.connectedDot} />}
          </View>
          <Text style={styles.walletLabel}>{connected ? '0x1a2b…9c0d' : 'No Wallet Connected'}</Text>
          <Text style={styles.walletRole}>{connected ? 'Verified Donor · Mumbai' : 'Connect to start donating'}</Text>

          <TouchableOpacity
            style={[styles.connectBtn, { backgroundColor: connected ? 'rgba(255,255,255,0.15)' : '#fff' }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setConnected(c => !c); }}
            activeOpacity={0.85}
          >
            <Ionicons name={connected ? 'wallet' : 'wallet-outline'} size={16} color={connected ? '#fff' : colors.primary} />
            <Text style={[styles.connectBtnText, { color: connected ? '#fff' : colors.primary }]}>
              {connected ? 'Disconnect' : 'Connect Wallet'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats */}
      {connected && (
        <View style={[styles.statsRow, { paddingHorizontal: 16, marginTop: 20 }]}>
          {[
            { label: 'Donations', value: USER_STATS.donationsMade, icon: 'heart' as const, color: colors.primary },
            { label: 'Meals', value: USER_STATS.mealsContributed, icon: 'restaurant' as const, color: colors.primary },
            { label: 'HBK', value: USER_STATS.tokensEarned, icon: 'logo-bitcoin' as const, color: colors.tokenGold },
          ].map(stat => (
            <View key={stat.label} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={stat.icon} size={18} color={stat.color} />
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
            <View key={a.id} style={[styles.achievementCard, {
              backgroundColor: colors.card,
              borderColor: a.earned ? a.color + '50' : colors.border,
              opacity: a.earned ? 1 : 0.5,
            }]}>
              <View style={[styles.achievementIcon, { backgroundColor: a.color + '20' }]}>
                <Ionicons name={a.icon} size={20} color={a.earned ? a.color : colors.mutedForeground} />
              </View>
              <Text style={[styles.achievementTitle, { color: colors.foreground }]} numberOfLines={1}>{a.title}</Text>
              <Text style={[styles.achievementDesc, { color: colors.mutedForeground }]} numberOfLines={2}>{a.description}</Text>
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

          {/* Dark Mode Row */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name={isDark ? 'moon' : 'sunny'} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => { Haptics.selectionAsync(); toggleTheme(); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Notifications Row */}
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="notifications-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={v => { Haptics.selectionAsync(); setNotifications(v); }}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#fff"
            />
          </View>

          {/* Transaction History */}
          <TouchableOpacity
            style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/history'); }}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIconBox, { backgroundColor: colors.primary + '18' }]}>
                <Ionicons name="cube-outline" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Transaction History</Text>
            </View>
            <View style={styles.settingRight}>
              <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.newBadgeText}>ON-CHAIN</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </View>
          </TouchableOpacity>

          {[
            { icon: 'shield-outline' as const, label: 'Privacy Policy' },
            { icon: 'document-text-outline' as const, label: 'Terms of Service' },
            { icon: 'help-circle-outline' as const, label: 'Help & Support' },
            { icon: 'information-circle-outline' as const, label: 'About HungerBlock' },
          ].map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: i < 3 ? 1 : 0 }]}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconBox, { backgroundColor: colors.muted }]}>
                  <Ionicons name={item.icon} size={16} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>HungerBlock v1.0.0 · Ethereum · Polygon</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHeader: { paddingHorizontal: 20, paddingBottom: 28, gap: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoWrapper: { width: 36, height: 36, borderRadius: 9, overflow: 'hidden' },
  logoImg: { width: 36, height: 36 },
  brandName: { fontSize: 16, fontWeight: '700', color: '#fff', fontFamily: 'DMSans_700Bold' },
  themeBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarSection: { alignItems: 'center', gap: 6 },
  avatarContainer: { position: 'relative', marginBottom: 4 },
  avatar: { width: 76, height: 76, borderRadius: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.25)' },
  connectedDot: { position: 'absolute', bottom: 3, right: 3, width: 16, height: 16, borderRadius: 8, backgroundColor: '#2D7A4A', borderWidth: 2, borderColor: '#2D5638' },
  walletLabel: { fontSize: 15, fontWeight: '700', color: '#fff', fontFamily: 'DMSans_700Bold' },
  walletRole: { fontSize: 13, color: 'rgba(255,255,255,0.65)', fontFamily: 'DMSans_400Regular' },
  connectBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  connectBtnText: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  statsRow: { flexDirection: 'row', gap: 10 },
  statItem: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 12, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'DMSans_400Regular', textAlign: 'center' },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', fontFamily: 'DMSans_700Bold', marginBottom: 14 },
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  achievementCard: { width: '47%', borderRadius: 14, borderWidth: 1.5, padding: 12, gap: 6, position: 'relative' },
  achievementIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  achievementTitle: { fontSize: 13, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  achievementDesc: { fontSize: 11, fontFamily: 'DMSans_400Regular', lineHeight: 15 },
  earnedBadge: { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  settingsCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconBox: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontFamily: 'DMSans_400Regular' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 24, fontFamily: 'DMSans_400Regular' },
  settingRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  newBadgeText: { fontSize: 9, fontFamily: 'DMSans_700Bold', color: '#fff', letterSpacing: 0.5 },
});
