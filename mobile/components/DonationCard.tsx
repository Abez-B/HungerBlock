import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Donation } from '@/constants/mockData';

interface DonationCardProps {
  donation: Donation;
  onPress?: () => void;
}

function getFreshnessColor(score: number): string {
  if (score >= 90) return '#2D7A4A';
  if (score >= 75) return '#B7770D';
  return '#C0392B';
}

function getStatusColor(status: Donation['status'], primary: string): { bg: string; text: string } {
  switch (status) {
    case 'Active': return { bg: '#2D7A4A18', text: '#2D7A4A' };
    case 'Matched': return { bg: '#B7770D18', text: '#B7770D' };
    case 'Verified': return { bg: primary + '18', text: primary };
    case 'Cancelled': return { bg: '#C0392B18', text: '#C0392B' };
    default: return { bg: '#88888818', text: '#888888' };
  }
}

function getExpiryText(expiryDate: string): { text: string; urgent: boolean } {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
  if (diff < 0) return { text: 'Expired', urgent: true };
  if (diff < 6) return { text: `${diff}h left`, urgent: true };
  if (diff < 24) return { text: `${diff}h left`, urgent: false };
  return { text: `${Math.floor(diff / 24)}d left`, urgent: false };
}

export default function DonationCard({ donation, onPress }: DonationCardProps) {
  const colors = useColors();
  const freshnessColor = getFreshnessColor(donation.freshnessScore);
  const statusColors = getStatusColor(donation.status, colors.primary);
  const expiry = getExpiryText(donation.expiryDate);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
    >
      <View style={styles.row}>
        <View style={[styles.emojiBox, { backgroundColor: colors.accent }]}>
          <Text style={styles.emoji}>{donation.imageEmoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.foodType, { color: colors.foreground }]} numberOfLines={1}>{donation.foodType}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
              <Text style={[styles.statusText, { color: statusColors.text }]}>{donation.status}</Text>
            </View>
          </View>
          <Text style={[styles.donor, { color: colors.mutedForeground }]} numberOfLines={1}>{donation.donor}</Text>
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{donation.quantity} {donation.unit}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={11} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>{donation.location}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerLeft}>
          <View style={[styles.freshDot, { backgroundColor: freshnessColor }]} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>{donation.freshnessScore}% fresh</Text>
        </View>
        <View style={styles.footerRight}>
          <Ionicons name="time-outline" size={11} color={expiry.urgent ? colors.urgent : colors.mutedForeground} />
          <Text style={[styles.footerText, {
            color: expiry.urgent ? colors.urgent : colors.mutedForeground,
            fontFamily: expiry.urgent ? 'DMSans_700Bold' : 'DMSans_400Regular',
          }]}>{expiry.text}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  row: { flexDirection: 'row', padding: 14, gap: 12 },
  emojiBox: { width: 50, height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 24 },
  content: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  foodType: { fontSize: 15, fontWeight: '600', fontFamily: 'DMSans_700Bold', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'DMSans_700Bold' },
  donor: { fontSize: 13, fontFamily: 'DMSans_400Regular' },
  meta: { flexDirection: 'row', gap: 12, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, fontFamily: 'DMSans_400Regular' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  freshDot: { width: 7, height: 7, borderRadius: 3.5 },
  footerRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, fontFamily: 'DMSans_400Regular' },
});
