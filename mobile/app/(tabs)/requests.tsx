import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import RequestCard from '@/components/RequestCard';
import { REQUESTS } from '@/constants/mockData';

const URGENCY_FILTERS = ['All', 'Critical', 'Urgent', 'High', 'Medium', 'Low'];

export default function RequestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const urgencyMap: Record<string, number> = {
    Critical: 5, Urgent: 4, High: 3, Medium: 2, Low: 1,
  };

  const filtered = REQUESTS.filter(r => {
    const matchesSearch = r.foodType.toLowerCase().includes(search.toLowerCase()) ||
      r.ngoName.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || r.urgencyLevel === urgencyMap[urgencyFilter];
    return matchesSearch && matchesUrgency;
  });

  const criticalCount = REQUESTS.filter(r => r.urgencyLevel >= 5 && r.status === 'Open').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topInset + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Requests</Text>
            {criticalCount > 0 && (
              <View style={styles.criticalBadge}>
                <View style={styles.criticalDot} />
                <Text style={styles.criticalText}>{criticalCount} critical</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#2563EB' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/request');
            }}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.input, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search food type, NGO, location..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Urgency Filters */}
        <View>
          <FlatList
            data={URGENCY_FILTERS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item}
            renderItem={({ item }) => {
              const isActive = urgencyFilter === item;
              const urgencyColor = item === 'Critical' ? '#DC2626' :
                item === 'Urgent' ? '#EA580C' :
                item === 'High' ? '#D97706' :
                item === 'Medium' ? '#2563EB' :
                item === 'Low' ? '#16A34A' : colors.primary;
              return (
                <TouchableOpacity
                  style={[styles.filterChip, {
                    backgroundColor: isActive ? urgencyColor : colors.muted,
                    marginRight: 8,
                  }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setUrgencyFilter(item);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.filterText, {
                    color: isActive ? '#fff' : colors.mutedForeground,
                    fontWeight: isActive ? '600' : '400',
                  }]}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <RequestCard request={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!filtered.length}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Ionicons name="hand-left-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No requests found</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Try adjusting your search or urgency filter
            </Text>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={{ height: Platform.OS === 'web' ? 34 : 0 }} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  criticalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  criticalDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#DC2626',
  },
  criticalText: {
    fontSize: 12,
    color: '#DC2626',
    fontFamily: 'Inter_500Medium',
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  list: {
    padding: 16,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
