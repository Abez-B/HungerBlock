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

const STEPS = ['Photo', 'Details', 'Review'];
const FOOD_TYPES = ['Cooked Meals', 'Rice & Grains', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Other'];
const UNITS = ['servings', 'kg', 'pieces', 'boxes', 'plates', 'liters'];

export default function DonateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    foodType: '',
    quantity: '',
    unit: 'servings',
    location: '',
    expiryDate: '',
    notes: '',
  });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;

  const isStep1Valid = form.foodType && form.quantity && form.location && form.expiryDate;

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      router.back();
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Donate Food</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Progress */}
        <View style={styles.progress}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, {
                backgroundColor: i <= step ? colors.primary : colors.muted,
              }]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={[styles.stepNum, { color: i <= step ? '#fff' : colors.mutedForeground }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, {
                color: i <= step ? colors.primary : colors.mutedForeground,
                fontWeight: i === step ? '600' : '400',
              }]}>{s}</Text>
              {i < STEPS.length - 1 && (
                <View style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />
              )}
            </View>
          ))}
        </View>

        <ScrollView
          style={styles.body}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Step 0: Photo (simulated) */}
          {step === 0 && (
            <View style={styles.stepContent}>
              <TouchableOpacity
                style={[styles.photoUpload, { borderColor: colors.border, backgroundColor: colors.card }]}
                activeOpacity={0.8}
                onPress={() => Haptics.selectionAsync()}
              >
                <View style={[styles.photoIcon, { backgroundColor: colors.accent }]}>
                  <Ionicons name="camera" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.photoTitle, { color: colors.foreground }]}>Upload Food Photo</Text>
                <Text style={[styles.photoSub, { color: colors.mutedForeground }]}>
                  Our AI will verify freshness and detect food type
                </Text>
                <View style={[styles.aiTag, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="flash" size={12} color={colors.primary} />
                  <Text style={[styles.aiTagText, { color: colors.primary }]}>AI-Powered Analysis</Text>
                </View>
              </TouchableOpacity>

              <Text style={[styles.orText, { color: colors.mutedForeground }]}>OR SELECT FOOD TYPE</Text>

              <View style={styles.foodTypeGrid}>
                {FOOD_TYPES.map(ft => (
                  <TouchableOpacity
                    key={ft}
                    style={[styles.foodTypeChip, {
                      backgroundColor: form.foodType === ft ? colors.primary : colors.card,
                      borderColor: form.foodType === ft ? colors.primary : colors.border,
                    }]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setForm(f => ({ ...f, foodType: ft }));
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.foodTypeText, {
                      color: form.foodType === ft ? '#fff' : colors.foreground,
                    }]}>{ft}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1: Details */}
          {step === 1 && (
            <View style={styles.stepContent}>
              <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Food Type</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={form.foodType}
                    onChangeText={v => setForm(f => ({ ...f, foodType: v }))}
                    placeholder="e.g. Rice & Dal"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Quantity</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={form.quantity}
                    onChangeText={v => setForm(f => ({ ...f, quantity: v }))}
                    placeholder="e.g. 50"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Unit</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                    {UNITS.map(u => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.unitChip, {
                          backgroundColor: form.unit === u ? colors.primary : colors.muted,
                        }]}
                        onPress={() => setForm(f => ({ ...f, unit: u }))}
                      >
                        <Text style={[styles.unitText, { color: form.unit === u ? '#fff' : colors.mutedForeground }]}>
                          {u}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Location</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={form.location}
                    onChangeText={v => setForm(f => ({ ...f, location: v }))}
                    placeholder="Pickup address"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View style={[styles.inputRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Expiry Date</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={form.expiryDate}
                    onChangeText={v => setForm(f => ({ ...f, expiryDate: v }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View style={styles.inputRow}>
                  <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>Notes</Text>
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    value={form.notes}
                    onChangeText={v => setForm(f => ({ ...f, notes: v }))}
                    placeholder="Optional details..."
                    placeholderTextColor={colors.mutedForeground}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <View style={styles.stepContent}>
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.reviewTitle, { color: colors.foreground }]}>Donation Summary</Text>

                {[
                  { label: 'Food Type', value: form.foodType || 'Not specified' },
                  { label: 'Quantity', value: `${form.quantity} ${form.unit}` },
                  { label: 'Location', value: form.location || 'Not specified' },
                  { label: 'Expiry Date', value: form.expiryDate || 'Not specified' },
                ].map((item, i) => (
                  <View key={item.label} style={[styles.reviewRow, i < 3 ? { borderBottomColor: colors.border, borderBottomWidth: 1 } : {}]}>
                    <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                    <Text style={[styles.reviewValue, { color: colors.foreground }]}>{item.value}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.blockchainInfo, { backgroundColor: colors.accent, borderColor: colors.primary + '30' }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.blockchainTitle, { color: colors.primary }]}>On-Chain Recording</Text>
                  <Text style={[styles.blockchainText, { color: colors.mutedForeground }]}>
                    This donation will be recorded on the Ethereum blockchain for full transparency.
                  </Text>
                </View>
              </View>

              <View style={[styles.rewardInfo, { backgroundColor: '#D97706' + '18', borderColor: '#D97706' + '40' }]}>
                <Ionicons name="logo-bitcoin" size={20} color="#D97706" />
                <Text style={[styles.rewardText, { color: '#D97706' }]}>
                  Earn ~40 HBK tokens for this donation
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          paddingBottom: bottomInset + 12,
        }]}>
          {step > 0 && (
            <TouchableOpacity
              style={[styles.backBtn, { borderColor: colors.border }]}
              onPress={() => { Haptics.selectionAsync(); setStep(s => s - 1); }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, {
              backgroundColor: colors.primary,
              opacity: (step === 1 && !isStep1Valid) ? 0.5 : 1,
              flex: 1,
            }]}
            onPress={() => {
              if (step < 2) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(s => s + 1); }
              else handleSubmit();
            }}
            disabled={step === 1 && !isStep1Valid}
            activeOpacity={0.85}
          >
            {submitting ? (
              <Text style={styles.nextBtnText}>Submitting...</Text>
            ) : (
              <>
                <Text style={styles.nextBtnText}>{step < 2 ? 'Continue' : 'Submit Donation'}</Text>
                <Ionicons name={step < 2 ? "arrow-forward" : "checkmark"} size={18} color="#fff" />
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
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  progress: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  stepCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  stepLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
  },
  body: { flex: 1 },
  stepContent: { gap: 16 },
  photoUpload: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  photoIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  photoTitle: {
    fontSize: 17,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  photoSub: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
    fontFamily: 'Inter_400Regular',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  aiTagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  orText: {
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: 'Inter_500Medium',
    marginVertical: 4,
  },
  foodTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  foodTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  foodTypeText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  inputGroup: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  inputRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    paddingVertical: 0,
  },
  unitScroll: { marginTop: 6 },
  unitChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginRight: 6,
  },
  unitText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  reviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    padding: 16,
    paddingBottom: 12,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reviewLabel: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
    maxWidth: '60%',
    textAlign: 'right',
  },
  blockchainInfo: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  blockchainTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 3,
  },
  blockchainText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
  },
  rewardInfo: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter_500Medium',
  },
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
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },
});
