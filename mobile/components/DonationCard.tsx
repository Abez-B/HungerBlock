import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { Donation } from '@/constants/mockData';

interface DonationCardProps {
  donation: Donation;
  onPress?: () => void;
}

function getFreshnessColor(score: number, primary: string): string {
  if (score >= 90) return '#16A34A';
  if (score >= 75) return '#D97706';
  return '#DC2626';
}

function getStatusColor(status: Donation['status'], colors: ReturnType<typeof useColors>): string {
  switch (status) {
    case 'Active': return colors.success;
    case 'Matched': return colors.warning;
    case 'Verified': return colors.primary;
    case 'Cancelled': return colors.destructive;
    default: return colors.mutedForeground;
  }
}

function getExpiryText(expiryDate: string): string {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
  if (diff < 0) return 'Expired';
  if (diff < 24) return `${diff}h left`;
  return `${Math.floor(diff / 24)}d left`;
}

export default function DonationCard({ donation, onPress }: DonationCardProps) {
  const colors = useColors();
  const freshnessColor = getFreshnessColor(donation.freshnessScore, colors.primary);
  const statusColor = getStatusColor(donation.status, colors);
  const expiryText = getExpiryText(donation.expiryDate);
  const isExpiringSoon = expiryText.includes('h left') && parseInt(expiryText) < 6;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, {
        backgroundColor: colors.card,
        borderColor: colors.border,
        shadowColor: colors.shadow,
      }]}
    >
      <View style={styles.row}>
        <View style={[styles.emojiContainer, { backgroundColor: colors.accent }]}>
          <Text style={styles.emoji}>{donation.imageEmoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.foodType, { color: colors.foreground }]} numberOfLines={1}>
              {donation.foodType}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{donation.status}</Text>
            </View>
          </View>
          <Text style={[styles.donor, { color: colors.mutedForeground }]} numberOfLines={1}>
            {donation.donor}
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="restaurant-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
                {donation.quantity} {donation.unit}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {donation.location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <View style={styles.footerLeft}>
          <View style={[styles.freshnessDot, { backgroundColor: freshnessColor }]} />
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            {donation.freshnessScore}% fresh
          </Text>
        </View>
        <View style={styles.footerRight}>
          <Ionicons
            name="time-outline"
            size={12}
            color={isExpiringSoon ? colors.destructive : colors.mutedForeground}
          />
          <Text style={[styles.footerText, {
            color: isExpiringSoon ? colors.destructive : colors.mutedForeground,
            fontWeight: isExpiringSoon ? '600' : '400',
          }]}>
            {expiryText}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  row: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  foodType: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  donor: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  freshnessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
  },
});
