import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Platform,
  Linking, Image, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useWallet } from '@/contexts/WalletContext';
import { useWalletTransactions } from '@/hooks/useWalletTransactions';
import { ChainTransaction, TxType } from '@/constants/mockData';

const TYPE_FILTERS: (TxType | 'All')[] = ['All', 'Donation', 'Token Reward', 'Verification', 'Request'];

function getTxStatusStyle(status: ChainTransaction['status']) {
  switch (status) {
    case 'Confirmed': return { bg: '#2D7A4A18', text: '#2D7A4A', icon: 'checkmark-circle' as const };
    case 'Pending':   return { bg: '#B7770D18', text: '#B7770D', icon: 'time' as const };
    case 'Failed':    return { bg: '#C0392B18', text: '#C0392B', icon: 'close-circle' as const };
  }
}

function getTxTypeIcon(type: TxType): keyof typeof Ionicons.glyphMap {
  switch (type) {
    case 'Donation':     return 'leaf';
    case 'Token Reward': return 'logo-bitcoin';
    case 'Verification': return 'shield-checkmark';
    case 'Request':      return 'hand-left';
  }
}

function getTxTypeColor(type: TxType, primary: string): string {
  switch (type) {
    case 'Donation':     return primary;
    case 'Token Reward': return '#B8860B';
    case 'Verification': return '#2471A3';
    case 'Request':      return '#8E44AD';
  }
}

function formatHash(hash: string) {
  return hash.slice(0, 10) + '…' + hash.slice(-8);
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function getEtherscanUrl(tx: ChainTransaction) {
  if (tx.network === 'Polygon') {
    return `https://polygonscan.com/tx/${tx.txHash}`;
  }
  return `https://etherscan.io/tx/${tx.txHash}`;
}

function TxCard({ tx }: { tx: ChainTransaction }) {
  const colors = useColors();
  const statusStyle = getTxStatusStyle(tx.status);
  const typeColor = getTxTypeColor(tx.type, colors.primary);
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: typeColor }]}
      onPress={() => { Haptics.selectionAsync(); setExpanded(e => !e); }}
      activeOpacity={0.85}
    >
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.typeIcon, { backgroundColor: typeColor + '18' }]}>
          <Ionicons name={getTxTypeIcon(tx.type)} size={18} color={typeColor} />
        </View>
        <View style={styles.cardMeta}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.txType, { color: colors.foreground }]}>{tx.type}</Text>
            {tx.hbkTokens > 0 && (
              <View style={[styles.tokenBadge, { backgroundColor: colors.tokenGold + '20' }]}>
                <Ionicons name="logo-bitcoin" size={10} color={colors.tokenGold} />
                <Text style={[styles.tokenText, { color: colors.tokenGold }]}>+{tx.hbkTokens} HBK</Text>
              </View>
            )}
          </View>
          <Text style={[styles.txFood, { color: colors.mutedForeground }]} numberOfLines={1}>
            {tx.foodType} · {tx.quantity}
          </Text>
        </View>
        <View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <Ionicons name={statusStyle.icon} size={11} color={statusStyle.text} />
            <Text style={[styles.statusText, { color: statusStyle.text }]}>{tx.status}</Text>
          </View>
          <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{formatTime(tx.timestamp)}</Text>
        </View>
      </View>

      {/* Hash row */}
      <View style={[styles.hashRow, { borderTopColor: colors.border }]}>
        <View style={[styles.networkBadge, { backgroundColor: tx.network === 'Polygon' ? '#8E44AD18' : '#2471A318' }]}>
          <Text style={[styles.networkText, { color: tx.network === 'Polygon' ? '#8E44AD' : '#2471A3' }]}>
            {tx.network}
          </Text>
        </View>
        <Text style={[styles.hashText, { color: colors.mutedForeground }]} numberOfLines={1}>
          {formatHash(tx.txHash)}
        </Text>
        <Text style={[styles.blockText, { color: colors.mutedForeground }]}>
          #{tx.blockNumber.toLocaleString()}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={colors.mutedForeground} />
      </View>

      {/* Expanded detail */}
      {expanded && (
        <View style={[styles.expandedSection, { borderTopColor: colors.border }]}>
          {[
            { label: 'Full TX Hash', value: tx.txHash, mono: true },
            { label: 'From', value: tx.from, mono: true },
            { label: 'To', value: tx.to, mono: false },
            { label: 'Gas Used', value: tx.gasUsed, mono: false },
            { label: 'Confirmations', value: tx.confirmations.toLocaleString(), mono: false },
          ].map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text
                style={[styles.detailValue, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {row.value}
              </Text>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.etherscanBtn, { backgroundColor: typeColor, opacity: tx.status === 'Failed' ? 0.5 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(getEtherscanUrl(tx)); }}
            disabled={tx.status === 'Failed'}
            activeOpacity={0.85}
          >
            <Ionicons name="open-outline" size={14} color="#fff" />
            <Text style={styles.etherscanBtnText}>
              View on {tx.network === 'Polygon' ? 'Polygonscan' : 'Etherscan'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

function LoadingState() {
  const colors = useColors();
  return (
    <View style={styles.centerState}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.centerTitle, { color: colors.foreground }]}>Fetching on-chain data…</Text>
      <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
        Querying Etherscan & Polygonscan
      </Text>
    </View>
  );
}

function ErrorState({ message, onRetry, hasApiKey }: { message: string; onRetry: () => void; hasApiKey: boolean }) {
  const colors = useColors();
  const needsKey = !hasApiKey || message.toLowerCase().includes('rate') || message.toLowerCase().includes('api key') || message.toLowerCase().includes('notok');
  return (
    <View style={styles.centerState}>
      <Ionicons name="warning-outline" size={48} color="#C0392B" />
      <Text style={[styles.centerTitle, { color: colors.foreground }]}>
        {needsKey ? 'API Key Required' : 'Could not load transactions'}
      </Text>
      {needsKey ? (
        <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
          Set your free Etherscan and Polygonscan API keys as{'\n'}
          EXPO_PUBLIC_ETHERSCAN_API_KEY and{'\n'}
          EXPO_PUBLIC_POLYGONSCAN_API_KEY{'\n'}
          in the Replit Secrets panel to fetch live data.
        </Text>
      ) : (
        <Text style={[styles.centerText, { color: colors.mutedForeground }]}>{message}</Text>
      )}
      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
        onPress={onRetry}
        activeOpacity={0.85}
      >
        <Ionicons name="refresh" size={14} color="#fff" />
        <Text style={styles.retryBtnText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

function NoWalletState() {
  const colors = useColors();
  return (
    <View style={styles.centerState}>
      <Ionicons name="wallet-outline" size={48} color={colors.mutedForeground} />
      <Text style={[styles.centerTitle, { color: colors.foreground }]}>No Wallet Connected</Text>
      <Text style={[styles.centerText, { color: colors.mutedForeground }]}>
        Connect a wallet on the Profile tab to view your on-chain transaction history.
      </Text>
      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(tabs)/profile')}
        activeOpacity={0.85}
      >
        <Ionicons name="person-outline" size={14} color="#fff" />
        <Text style={styles.retryBtnText}>Go to Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HistoryScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { connected, walletAddress } = useWallet();
  const [filter, setFilter] = useState<TxType | 'All'>('All');
  const topInset = Platform.OS === 'web' ? 67 : insets.top;

  const { transactions, isLoading, isError, errorMessage, refetch, hasApiKey } =
    useWalletTransactions(walletAddress, connected);

  const filtered = filter === 'All' ? transactions : transactions.filter(t => t.type === filter);
  const totalHBK = transactions.filter(t => t.status === 'Confirmed').reduce((sum, t) => sum + t.hbkTokens, 0);
  const confirmedCount = transactions.filter(t => t.status === 'Confirmed').length;

  const shortAddress = walletAddress
    ? walletAddress.slice(0, 6) + '…' + walletAddress.slice(-4)
    : '—';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1A2E1E', '#0F1A12'] : ['#2D5638', '#3D6B4A']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 12 }]}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.logoMini}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logoMiniImg} resizeMode="cover" />
            </View>
            <Text style={styles.headerTitle}>Chain History</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => { Haptics.selectionAsync(); refetch(); }}
            activeOpacity={0.7}
            disabled={isLoading || !connected}
          >
            <Ionicons name="refresh" size={18} color={connected ? '#fff' : 'rgba(255,255,255,0.3)'} />
          </TouchableOpacity>
        </View>

        {/* Wallet address */}
        {connected && (
          <View style={styles.addressRow}>
            <View style={[styles.connectedDot, { backgroundColor: '#2D7A4A' }]} />
            <Text style={styles.addressText} numberOfLines={1}>{shortAddress}</Text>
            {isLoading && <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={{ marginLeft: 6 }} />}
          </View>
        )}

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{transactions.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{confirmedCount}</Text>
            <Text style={styles.statLabel}>Confirmed</Text>
          </View>
          <View style={[styles.statDivider]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: '#D4A017' }]}>{totalHBK}</Text>
            <Text style={styles.statLabel}>HBK Earned</Text>
          </View>
        </View>

        {/* Network tags */}
        <View style={styles.networkRow}>
          <View style={styles.networkTag}>
            <View style={[styles.networkDot, { backgroundColor: '#627EEA' }]} />
            <Text style={styles.networkTagText}>Ethereum Mainnet</Text>
          </View>
          <View style={styles.networkTag}>
            <View style={[styles.networkDot, { backgroundColor: '#8E44AD' }]} />
            <Text style={styles.networkTagText}>Polygon</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Filter chips */}
      <View style={[styles.filterBar, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <FlatList
          data={TYPE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={f => f}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: filter === item ? colors.primary : colors.muted }]}
              onPress={() => { Haptics.selectionAsync(); setFilter(item); }}
              activeOpacity={0.8}
            >
              {item !== 'All' && (
                <Ionicons name={getTxTypeIcon(item as TxType)} size={12} color={filter === item ? '#fff' : colors.mutedForeground} />
              )}
              <Text style={[styles.filterText, { color: filter === item ? '#fff' : colors.mutedForeground }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Body */}
      {!connected ? (
        <NoWalletState />
      ) : isLoading && transactions.length === 0 ? (
        <LoadingState />
      ) : isError && transactions.length === 0 ? (
        <ErrorState message={errorMessage ?? 'Unknown error'} onRetry={refetch} hasApiKey={hasApiKey} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => t.id}
          renderItem={({ item }) => <TxCard tx={item} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View style={styles.empty}>
              <Ionicons name="cube-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No transactions found</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Try a different filter</Text>
            </View>
          )}
          ListFooterComponent={
            transactions.length > 0 ? () => (
              <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <Ionicons name="lock-closed" size={13} color={colors.mutedForeground} />
                <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
                  All records are immutable and publicly verifiable on-chain
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20, gap: 14 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMini: { width: 28, height: 28, borderRadius: 7, overflow: 'hidden' },
  logoMiniImg: { width: 28, height: 28 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff', fontFamily: 'DMSans_700Bold' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, alignSelf: 'flex-start' },
  connectedDot: { width: 7, height: 7, borderRadius: 3.5 },
  addressText: { fontSize: 13, color: 'rgba(255,255,255,0.9)', fontFamily: 'DMSans_500Medium' },
  statsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 14 },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 22, fontWeight: '700', color: '#fff', fontFamily: 'DMSans_700Bold' },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontFamily: 'DMSans_400Regular' },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' },
  networkRow: { flexDirection: 'row', gap: 12 },
  networkTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  networkDot: { width: 7, height: 7, borderRadius: 3.5 },
  networkTagText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans_500Medium' },
  filterBar: { paddingVertical: 10, borderBottomWidth: 1 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20 },
  filterText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  list: { padding: 14, gap: 2 },
  card: { borderRadius: 16, borderWidth: 1, borderLeftWidth: 4, marginBottom: 10, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 13 },
  typeIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardMeta: { flex: 1, gap: 3 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  txType: { fontSize: 14, fontFamily: 'DMSans_700Bold' },
  tokenBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  tokenText: { fontSize: 11, fontFamily: 'DMSans_700Bold' },
  txFood: { fontSize: 12, fontFamily: 'DMSans_400Regular' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-end' },
  statusText: { fontSize: 11, fontFamily: 'DMSans_700Bold' },
  timeText: { fontSize: 11, fontFamily: 'DMSans_400Regular', textAlign: 'right', marginTop: 4 },
  hashRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 9, borderTopWidth: 1 },
  networkBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  networkText: { fontSize: 10, fontFamily: 'DMSans_700Bold' },
  hashText: { flex: 1, fontSize: 12, fontFamily: 'DMSans_400Regular' },
  blockText: { fontSize: 11, fontFamily: 'DMSans_400Regular' },
  expandedSection: { borderTopWidth: 1, padding: 13, gap: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  detailLabel: { fontSize: 12, fontFamily: 'DMSans_500Medium', flexShrink: 0 },
  detailValue: { fontSize: 12, fontFamily: 'DMSans_400Regular', textAlign: 'right', flex: 1 },
  etherscanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 11, borderRadius: 12, marginTop: 4 },
  etherscanBtnText: { fontSize: 13, fontWeight: '600', color: '#fff', fontFamily: 'DMSans_700Bold' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  centerTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', textAlign: 'center', marginTop: 8 },
  centerText: { fontSize: 13, fontFamily: 'DMSans_400Regular', textAlign: 'center', lineHeight: 20 },
  retryBtn: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginTop: 8 },
  retryBtnText: { fontSize: 14, fontWeight: '600', color: '#fff', fontFamily: 'DMSans_700Bold' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 18, fontFamily: 'DMSans_700Bold', marginTop: 8 },
  emptyText: { fontSize: 14, fontFamily: 'DMSans_400Regular' },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 7, justifyContent: 'center', paddingVertical: 18, borderTopWidth: 1, marginTop: 4 },
  footerText: { fontSize: 12, fontFamily: 'DMSans_400Regular', textAlign: 'center', flex: 1 },
});
