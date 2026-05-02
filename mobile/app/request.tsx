import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const URGENCY_LEVELS = [
  { level: 1, label: 'Low', color: '#16A34A', desc: 'Within 2 weeks' },
  { level: 2, label: 'Medium', color: '#2563EB', desc: 'Within a week' },
  { level: 3, label: 'High', color: '#D97706', desc: 'Within 3 days' },
  { level: 4, label: 'Urgent', color: '#EA580C', desc: 'Within 24 hours' },
  { level: 5, label: 'Critical', color: '#DC2626', desc: 'Immediate need' },
];

export default function RequestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    foodType: '',
    quantityNeeded: '',
    unit: 'servings',
    location: '',
    urgencyLevel: 3,
    notes: '',
  });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const isValid = form.foodType && form.quantityNeeded && form.location;

  const handleSubmit = () => {
    if (!isValid) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.back();
    }, 1500);
  };

  const selectedUrgency = URGENCY_LEVELS.find(u => u.level === form.urgencyLevel)!;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, {
          paddingTop: topInset + 12,
          borderBottomColor: colors.border,
          backgroundColor: colors.background,
        }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Request Food</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* NGO Info Banner */}
          <View style={[styles.ngoBanner, { backgroundColor: '#2563EB' + '14', borderColor: '#2563EB' + '30' }]}>
            <Ionicons name="people" size={18} color="#2563EB" />
            <Text style={[styles.ngoBannerText, { color: '#2563EB' }]}>
              Requesting as: Seva Foundation
            </Text>
          </View>

          {/* Form Fields */}
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Food Type Needed</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={form.foodType}
                onChangeText={v => setForm(f => ({ ...f, foodType: v }))}
                placeholder="e.g. Cooked meals, vegetables..."
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Quantity Needed</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={form.quantityNeeded}
                onChangeText={v => setForm(f => ({ ...f, quantityNeeded: v }))}
                placeholder="e.g. 200"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Delivery Location</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={form.location}
                onChangeText={v => setForm(f => ({ ...f, location: v }))}
                placeholder="NGO address"
                placeholderTextColor={colors.mutedForeground}
              />
            </View>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Additional Notes</Text>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={form.notes}
                onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                placeholder="Any specific requirements..."
                placeholderTextColor={colors.mutedForeground}
                multiline
                numberOfLines={2}
              />
            </View>
          </View>

          {/* Urgency Selector */}
          <View style={{ marginTop: 16 }}>
            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Urgency Level</Text>
            <View style={styles.urgencyGrid}>
              {URGENCY_LEVELS.map(u => (
                <TouchableOpacity
                  key={u.level}
                  style={[styles.urgencyCard, {
                    backgroundColor: form.urgencyLevel === u.level ? u.color : colors.card,
                    borderColor: form.urgencyLevel === u.level ? u.color : colors.border,
                  }]}
                  onPress={() => { Haptics.selectionAsync(); setForm(f => ({ ...f, urgencyLevel: u.level })); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.urgencyLabel, {
                    color: form.urgencyLevel === u.level ? '#fff' : colors.foreground,
                  }]}>{u.label}</Text>
                  <Text style={[styles.urgencyDesc, {
                    color: form.urgencyLevel === u.level ? 'rgba(255,255,255,0.75)' : colors.mutedForeground,
                  }]}>{u.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: bottomInset + 12,
        }]}>
          <View style={[styles.urgencyIndicator, { backgroundColor: selectedUrgency.color + '20' }]}>
            <View style={[styles.urgencyDot, { backgroundColor: selectedUrgency.color }]} />
            <Text style={[styles.urgencyIndicatorText, { color: selectedUrgency.color }]}>
              {selectedUrgency.label} Urgency
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, {
              backgroundColor: isValid ? '#2563EB' : colors.muted,
              flex: 1,
            }]}
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <Text style={styles.submitBtnText}>Submitting...</Text>
            ) : (
              <>
                <Text style={styles.submitBtnText}>Submit Request</Text>
                <Ionicons name="checkmark" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  ngoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  ngoBannerText: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  inputGroup: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  inputRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 4, borderBottomWidth: 1 },
  inputLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { fontSize: 15, fontFamily: 'Inter_400Regular', paddingVertical: 0 },
  sectionLabel: { fontSize: 16, fontWeight: '600', fontFamily: 'Inter_600SemiBold', marginBottom: 12 },
  urgencyGrid: { gap: 8 },
  urgencyCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgencyLabel: { fontSize: 15, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  urgencyDesc: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  urgencyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  urgencyIndicatorText: { fontSize: 12, fontWeight: '600', fontFamily: 'Inter_600SemiBold' },
  submitBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'Inter_600SemiBold' },
});
