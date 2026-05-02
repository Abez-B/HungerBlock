import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { FoodRequest } from '@/constants/mockData';

interface RequestCardProps {
  request: FoodRequest;
  onPress?: () => void;
}

function getUrgencyLabel(level: number): string {
  return ['', 'Low', 'Medium', 'High', 'Urgent', 'Critical'][level] || 'Unknown';
}

function getUrgencyColor(level: number): string {
  if (level >= 5) return '#C0392B';
  if (level >= 4) return '#D35400';
  if (level >= 3) return '#B7770D';
  if (level >= 2) return '#2471A3';
  return '#2D7A4A';
}

function getStatusColor(status: FoodRequest['status']): string {
  switch (status) {
    case 'Open': return '#2471A3';
    case 'Matched': return '#B7770D';
    case 'Fulfilled': return '#2D7A4A';
    case 'Cancelled': return '#C0392B';
    default: return '#888';
  }
}

export default function RequestCard({ request, onPress }: RequestCardProps) {
  const colors = useColors();
  const urgencyColor = getUrgencyColor(request.urgencyLevel);
  const statusColor = getStatusColor(request.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, {
        backgroundColor: colors.card,
        borderColor: colors.border,
        borderLeftColor: urgencyColor,
        shadowColor: colors.shadow,
      }]}
    >
      <View style={styles.header}>
        <View style={styles.titleArea}>
          <Text style={[styles.foodType, { color: colors.foreground }]} numberOfLines={1}>{request.foodType}</Text>
          <View style={[styles.urgencyBadge, { backgroundColor: urgencyColor + '18' }]}>
            <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
            <Text style={[styles.urgencyText, { color: urgencyColor }]}>{getUrgencyLabel(request.urgencyLevel)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{request.status}</Text>
        </View>
      </View>

      <Text style={[styles.ngoName, { color: colors.primary }]} numberOfLines={1}>{request.ngoName}</Text>

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <Ionicons name="restaurant-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{request.quantityNeeded} {request.unit}</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]} numberOfLines={1}>{request.location}</Text>
        </View>
      </View>

      {request.notes && (
        <Text style={[styles.notes, { color: colors.mutedForeground, borderTopColor: colors.border }]} numberOfLines={2}>
          {request.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
    padding: 14,
    gap: 8,
    ...Platform.select({
      ios: { shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  titleArea: { flex: 1, gap: 4 },
  foodType: { fontSize: 15, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  urgencyText: { fontSize: 11, fontFamily: 'DMSans_700Bold', textTransform: 'uppercase', letterSpacing: 0.4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: 'DMSans_700Bold' },
  ngoName: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  meta: { flexDirection: 'row', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 12, fontFamily: 'DMSans_400Regular', flex: 1 },
  notes: { fontSize: 12, lineHeight: 18, paddingTop: 8, borderTopWidth: 1, fontFamily: 'DMSans_400Regular' },
});
