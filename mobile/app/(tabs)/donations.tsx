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
import DonationCard from '@/components/DonationCard';
import { DONATIONS } from '@/constants/mockData';

const FILTERS = ['All', 'Active', 'Matched', 'Verified'];

export default function DonationsScreen() {
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const filtered = DONATIONS.filter(d => {
    const matchesSearch =
      d.foodType.toLowerCase().includes(search.toLowerCase()) ||
      d.donor.toLowerCase().includes(search.toLowerCase()) ||
      d.location.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === 'All' || d.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View style={styles.titleRow}>
            <View style={styles.logoMini}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logoMiniImg} resizeMode="cover" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Donations</Text>
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
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push('/donate'); }}
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
            placeholder="Search food, donor, location…"
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

        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, {
                backgroundColor: activeFilter === f ? colors.primary : colors.muted,
              }]}
              onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, {
                color: activeFilter === f ? '#fff' : colors.mutedForeground,
              }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <DonationCard donation={item} onPress={() => {}} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No donations found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Adjust your search or filters</Text>
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
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini: { width: 30, height: 30, borderRadius: 8, overflow: 'hidden' },
  logoMiniImg: { width: 30, height: 30 },
  title: { fontSize: 26, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  addBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: 'DMSans_400Regular' },
  filters: { flexDirection: 'row', gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  list: { padding: 16 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '600', fontFamily: 'DMSans_700Bold', marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: 'DMSans_400Regular', textAlign: 'center' },
});
