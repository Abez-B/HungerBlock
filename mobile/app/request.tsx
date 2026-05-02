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

const URGENCY_LEVELS = [
  { level: 1, label: 'Low', color: '#2D7A4A', desc: 'Within 2 weeks' },
  { level: 2, label: 'Medium', color: '#2471A3', desc: 'Within a week' },
  { level: 3, label: 'High', color: '#B7770D', desc: 'Within 3 days' },
  { level: 4, label: 'Urgent', color: '#D35400', desc: 'Within 24 hours' },
  { level: 5, label: 'Critical', color: '#C0392B', desc: 'Immediate need' },
];

export default function RequestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ foodType: '', quantityNeeded: '', unit: 'servings', location: '', urgencyLevel: 3, notes: '' });

  const topInset = Platform.OS === 'web' ? 67 : insets.top;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const isValid = form.foodType && form.quantityNeeded && form.location;
  const selectedUrgency = URGENCY_LEVELS.find(u => u.level === form.urgencyLevel)!;

  const handleSubmit = () => {
    if (!isValid) return;
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
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>Request Food</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 120 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* NGO Banner */}
          <View style={[styles.ngoBanner, { backgroundColor: '#2471A3' + '14', borderColor: '#2471A3' + '30' }]}>
            <Ionicons name="people" size={17} color="#2471A3" />
            <Text style={[styles.ngoLabel, { color: '#2471A3' }]}>Requesting as: Seva Foundation</Text>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { key: 'foodType', label: 'Food Type Needed', placeholder: 'e.g. Cooked meals…' },
              { key: 'quantityNeeded', label: 'Quantity Needed', placeholder: 'e.g. 200' },
              { key: 'location', label: 'Delivery Location', placeholder: 'NGO address' },
              { key: 'notes', label: 'Notes (optional)', placeholder: 'Specific requirements…' },
            ].map((field, i) => (
              <View key={field.key} style={[styles.fieldRow, { borderBottomColor: colors.border, borderBottomWidth: i < 3 ? 1 : 0 }]}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.foreground }]}
                  value={(form as any)[field.key]}
                  onChangeText={v => setForm(f => ({ ...f, [field.key]: v }))}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType={field.key === 'quantityNeeded' ? 'numeric' : 'default'}
                  multiline={field.key === 'notes'}
                />
              </View>
            ))}
          </View>

          {/* Urgency */}
          <View style={{ marginTop: 20, gap: 12 }}>
            <Text style={[styles.urgencyTitle, { color: colors.foreground }]}>Urgency Level</Text>
            <View style={{ gap: 8 }}>
              {URGENCY_LEVELS.map(u => (
                <TouchableOpacity
                  key={u.level}
                  style={[styles.urgencyOption, {
                    backgroundColor: form.urgencyLevel === u.level ? u.color : colors.card,
                    borderColor: form.urgencyLevel === u.level ? u.color : colors.border,
                  }]}
                  onPress={() => { Haptics.selectionAsync(); setForm(f => ({ ...f, urgencyLevel: u.level })); }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.urgencyLabel, { color: form.urgencyLevel === u.level ? '#fff' : colors.foreground }]}>{u.label}</Text>
                  <Text style={[styles.urgencyDesc, { color: form.urgencyLevel === u.level ? 'rgba(255,255,255,0.75)' : colors.mutedForeground }]}>{u.desc}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: bottomInset + 12 }]}>
          <View style={[styles.urgencyIndicator, { backgroundColor: selectedUrgency.color + '18' }]}>
            <View style={[styles.urgencyDot, { backgroundColor: selectedUrgency.color }]} />
            <Text style={[styles.urgencyIndicatorText, { color: selectedUrgency.color }]}>{selectedUrgency.label}</Text>
          </View>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: isValid ? '#2471A3' : colors.muted, flex: 1 }]}
            onPress={handleSubmit}
            disabled={!isValid || submitting}
            activeOpacity={0.85}
          >
            <Text style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit Request'}</Text>
            <Ionicons name="checkmark" size={18} color="#fff" />
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
  ngoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 16 },
  ngoLabel: { fontSize: 14, fontFamily: 'DMSans_500Medium' },
  formCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  fieldRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: 'DMSans_500Medium', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldInput: { fontSize: 15, fontFamily: 'DMSans_400Regular', paddingVertical: 0 },
  urgencyTitle: { fontSize: 16, fontFamily: 'DMSans_700Bold' },
  urgencyOption: { padding: 14, borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  urgencyLabel: { fontSize: 15, fontFamily: 'DMSans_700Bold' },
  urgencyDesc: { fontSize: 12, fontFamily: 'DMSans_400Regular' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, alignItems: 'center' },
  urgencyIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  urgencyDot: { width: 8, height: 8, borderRadius: 4 },
  urgencyIndicatorText: { fontSize: 12, fontFamily: 'DMSans_700Bold' },
  submitBtn: { height: 48, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff', fontFamily: 'DMSans_700Bold' },
});
