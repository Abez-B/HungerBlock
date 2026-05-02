import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/contexts/ThemeContext';
import RequestCard from '@/components/RequestCard';
import { REQUESTS } from '@/constants/mockData';

const URGENCY_FILTERS = ['All', 'Critical', 'Urgent', 'High', 'Medium', 'Low'];

export default function RequestsScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const urgencyMap: Record<string, number> = { Critical: 5, Urgent: 4, High: 3, Medium: 2, Low: 1 };

  const filtered = REQUESTS.filter(r => {
    const matchesSearch =
      r.foodType.toLowerCase().includes(search.toLowerCase()) ||
      r.ngoName.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || r.urgencyLevel === urgencyMap[urgencyFilter];
    return matchesSearch && matchesUrgency;
  });

  const criticalCount = REQUESTS.filter(r => r.urgencyLevel >= 5 && r.status === 'Open').length;

  const urgencyColor = (item: string) => {
    if (item === 'Critical') return '#C0392B';
    if (item === 'Urgent') return '#D35400';
    if (item === 'High') return '#B7770D';
    if (item === 'Medium') return '#2471A3';
    if (item === 'Low') return '#2D7A4A';
    return colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.titleArea}>
            <View style={styles.titleRow}>
              <View style={styles.logoMini}>
                <Image source={require('@/assets/images/icon.png')} style={styles.logoMiniImg} resizeMode="cover" />
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>Requests</Text>
            </View>
            {criticalCount > 0 && (
              <View style={styles.criticalBadge}>
                <View style={[styles.criticalDot, { backgroundColor: colors.urgent }]} />
                <Text style={[styles.criticalText, { color: colors.urgent }]}>{criticalCount} critical</Text>
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: colors.muted }]}
              onPress={() => { Haptics.selectionAsync(); toggleTheme(); }}
              activeOpacity={0.7}
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: '#2471A3' }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/request'); }}
              activeOpacity={0.85}
            >
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={17} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search NGO, food type, location…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={17} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={URGENCY_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item}
          renderItem={({ item }) => {
            const isActive = urgencyFilter === item;
            const uc = urgencyColor(item);
            return (
              <TouchableOpacity
                style={[styles.filterChip, {
                  backgroundColor: isActive ? uc : colors.muted,
                  marginRight: 8,
                }]}
                onPress={() => { Haptics.selectionAsync(); setUrgencyFilter(item); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, { color: isActive ? '#fff' : colors.mutedForeground }]}>{item}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <RequestCard request={item} onPress={() => {}} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="hand-left-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No requests found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try a different filter or search</Text>
          </View>
        )}
        ListFooterComponent={() => <View style={{ height: Platform.OS === 'web' ? 34 : 0 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleArea: { gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini: { width: 30, height: 30, borderRadius: 8, overflow: 'hidden' },
  logoMiniImg: { width: 30, height: 30 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  criticalBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  criticalDot: { width: 7, height: 7, borderRadius: 3.5 },
  criticalText: { fontSize: 12, fontFamily: 'DMSans_500Medium' },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'DMSans_400Regular' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'DMSans_700Bold', marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: 'DMSans_400Regular', textAlign: 'center' },
});
