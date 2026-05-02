import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
  KeyboardAvoidingView, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

const STEPS = ['Select', 'Details', 'Review'];
const FOOD_TYPES = ['Cooked Meals', 'Rice & Grains', 'Vegetables', 'Fruits', 'Bakery', 'Dairy', 'Other'];
const UNITS = ['servings', 'kg', 'pieces', 'boxes', 'plates', 'liters'];

export default function DonateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ foodType: '', quantity: '', unit: 'servings', location: '', expiryDate: '', notes: '' });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const isStep1Valid = form.foodType && form.quantity && form.location && form.expiryDate;

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); router.back(); }, 1500);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topInset + 12, borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.logoMini}>
              <Image source={require('@/assets/images/icon.png')} style={styles.logoMiniImg} resizeMode="cover" />
            </View>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Donate Food</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Steps */}
        <View style={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepItem}>
              <View style={[styles.stepCircle, { backgroundColor: i <= step ? colors.primary : colors.muted }]}>
                {i < step
                  ? <Ionicons name="checkmark" size={13} color="#fff" />
                  : <Text style={[styles.stepNum, { color: i <= step ? '#fff' : colors.mutedForeground }]}>{i + 1}</Text>
                }
              </View>
              <Text style={[styles.stepLabel, { color: i <= step ? colors.primary : colors.mutedForeground, fontFamily: i === step ? 'DMSans_700Bold' : 'DMSans_400Regular' }]}>{s}</Text>
              {i < STEPS.length - 1 && <View style={[styles.stepLine, { backgroundColor: i < step ? colors.primary : colors.border }]} />}
            </View>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Step 0 */}
          {step === 0 && (
            <View style={{ gap: 16 }}>
              <TouchableOpacity
                style={[styles.photoZone, { borderColor: colors.border, backgroundColor: colors.card }]}
                activeOpacity={0.8}
              >
                <View style={[styles.photoIconBox, { backgroundColor: colors.accent }]}>
                  <Ionicons name="camera" size={30} color={colors.primary} />
                </View>
                <Text style={[styles.photoTitle, { color: colors.foreground }]}>Add Food Photo</Text>
                <Text style={[styles.photoSub, { color: colors.mutedForeground }]}>AI verifies freshness & detects food type automatically</Text>
                <View style={[styles.aiBadge, { backgroundColor: colors.primary + '18' }]}>
                  <Ionicons name="flash" size={11} color={colors.primary} />
                  <Text style={[styles.aiBadgeText, { color: colors.primary }]}>AI-Powered Verification</Text>
                </View>
              </TouchableOpacity>

              <Text style={[styles.orLabel, { color: colors.mutedForeground }]}>OR CHOOSE FOOD TYPE</Text>
              <View style={styles.typeGrid}>
                {FOOD_TYPES.map(ft => (
                  <TouchableOpacity
                    key={ft}
                    style={[styles.typeChip, {
                      backgroundColor: form.foodType === ft ? colors.primary : colors.card,
                      borderColor: form.foodType === ft ? colors.primary : colors.border,
                    }]}
                    onPress={() => { Haptics.selectionAsync(); setForm(f => ({ ...f, foodType: ft })); }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.typeChipText, { color: form.foodType === ft ? '#fff' : colors.foreground }]}>{ft}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { key: 'foodType', label: 'Food Type', placeholder: 'e.g. Rice & Dal', keyboard: 'default' },
                { key: 'quantity', label: 'Quantity', placeholder: 'e.g. 50', keyboard: 'numeric' },
                { key: 'location', label: 'Pickup Location', placeholder: 'Full address', keyboard: 'default' },
                { key: 'expiryDate', label: 'Expiry Date', placeholder: 'YYYY-MM-DD', keyboard: 'default' },
                { key: 'notes', label: 'Notes (optional)', placeholder: 'Any special instructions…', keyboard: 'default' },
              ].map((field, i) => (
                <View key={field.key} style={[styles.fieldRow, { borderBottomColor: colors.border, borderBottomWidth: i < 4 ? 1 : 0 }]}>
                  {field.key === 'unit'
                    ? null
                    : <>
                        <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                        <TextInput
                          style={[styles.fieldInput, { color: colors.foreground }]}
                          value={(form as any)[field.key]}
                          onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                          placeholder={field.placeholder}
                          placeholderTextColor={colors.mutedForeground}
                          keyboardType={field.keyboard as any}
                          multiline={field.key === 'notes'}
                        />
                      </>
                  }
                </View>
              ))}
              {/* Unit picker */}
              <View style={styles.fieldRow}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Unit</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  {UNITS.map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unitChip, { backgroundColor: form.unit === u ? colors.primary : colors.muted, marginRight: 6 }]}
                      onPress={() => setForm(f => ({ ...f, unit: u }))}
                    >
                      <Text style={[styles.unitChipText, { color: form.unit === u ? '#fff' : colors.mutedForeground }]}>{u}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <View style={{ gap: 14 }}>
              <View style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.reviewTitle, { color: colors.foreground }]}>Donation Summary</Text>
                {[
                  { label: 'Food Type', value: form.foodType || 'Not specified' },
                  { label: 'Quantity', value: `${form.quantity} ${form.unit}` },
                  { label: 'Location', value: form.location || 'Not specified' },
                  { label: 'Expiry', value: form.expiryDate || 'Not specified' },
                ].map((row, i) => (
                  <View key={row.label} style={[styles.reviewRow, { borderBottomColor: colors.border, borderBottomWidth: i < 3 ? 1 : 0 }]}>
                    <Text style={[styles.reviewLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                    <Text style={[styles.reviewValue, { color: colors.foreground }]}>{row.value}</Text>
                  </View>
                ))}
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.accent, borderColor: colors.primary + '30' }]}>
                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.infoTitle, { color: colors.primary }]}>Recorded On-Chain</Text>
                  <Text style={[styles.infoText, { color: colors.mutedForeground }]}>This donation is permanently verified on the Ethereum blockchain.</Text>
                </View>
              </View>

              <View style={[styles.infoBox, { backgroundColor: colors.tokenGold + '14', borderColor: colors.tokenGold + '30' }]}>
                <Ionicons name="logo-bitcoin" size={18} color={colors.tokenGold} />
                <Text style={[styles.infoTitle, { color: colors.tokenGold }]}>Earn ~40 HBK Tokens</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: bottomInset + 12 }]}>
          {step > 0 && (
            <TouchableOpacity style={[styles.backBtn, { borderColor: colors.border }]} onPress={() => { Haptics.selectionAsync(); setStep(s => s - 1); }} activeOpacity={0.8}>
              <Ionicons name="arrow-back" size={20} color={colors.foreground} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primary, opacity: step === 1 && !isStep1Valid ? 0.5 : 1, flex: 1 }]}
            onPress={() => {
              if (step < 2) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStep(s => s + 1); }
              else handleSubmit();
            }}
            disabled={step === 1 && !isStep1Valid}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>{submitting ? 'Submitting…' : step < 2 ? 'Continue' : 'Submit Donation'}</Text>
            <Ionicons name={step < 2 ? 'arrow-forward' : 'checkmark'} size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoMini: { width: 26, height: 26, borderRadius: 7, overflow: 'hidden' },
  logoMiniImg: { width: 26, height: 26 },
  headerTitle: { fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  stepsRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 6 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 12, fontFamily: 'DMSans_700Bold' },
  stepLabel: { fontSize: 12 },
  stepLine: { flex: 1, height: 2, borderRadius: 1 },
  photoZone: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 18, padding: 28, alignItems: 'center', gap: 10 },
  photoIconBox: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  photoTitle: { fontSize: 16, fontFamily: 'DMSans_700Bold' },
  photoSub: { fontSize: 13, fontFamily: 'DMSans_400Regular', textAlign: 'center', lineHeight: 19, maxWidth: 260 },
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4 },
  aiBadgeText: { fontSize: 12, fontFamily: 'DMSans_500Medium' },
  orLabel: { textAlign: 'center', fontSize: 11, letterSpacing: 1.5, fontFamily: 'DMSans_500Medium' },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  typeChipText: { fontSize: 13, fontFamily: 'DMSans_500Medium' },
  formCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { fontSize: 15, fontFamily: 'DMSans_400Regular', paddingVertical: 0 },
  unitChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  unitChipText: { fontSize: 13, fontFamily: 'DMSans_400Regular' },
  reviewCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  reviewTitle: { fontSize: 15, fontFamily: 'DMSans_700Bold', padding: 14, paddingBottom: 10 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  reviewLabel: { fontSize: 14, fontFamily: 'DMSans_400Regular' },
  reviewValue: { fontSize: 14, fontFamily: 'DMSans_500Medium', maxWidth: '58%', textAlign: 'right' },
  infoBox: { flexDirection: 'row', gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: 'flex-start' },
  infoTitle: { fontSize: 14, fontFamily: 'DMSans_700Bold', marginBottom: 2 },
  infoText: { fontSize: 12, fontFamily: 'DMSans_400Regular', lineHeight: 17 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  backBtn: { width: 48, height: 48, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  nextBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  nextBtnText: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'DMSans_700Bold' },
});
