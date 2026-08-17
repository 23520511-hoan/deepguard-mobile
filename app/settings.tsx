import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import { AI_MODELS } from './_config/models';
import ScreenHeader from './_components/ScreenHeader';

export default function SettingsScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();

  const {
    selectedModelId,
    setSelectedModelId,
    sensitivityThreshold,
    setSensitivityThreshold,
    saveThumbnails,
    setSaveThumbnails,
    blurWarning,
    setBlurWarning,
    theme,
    toggleTheme,
    language,
    setLanguage,
    clearHistory,
  } = useAppStore();

  const confirmClear = () => {
    Alert.alert(t('settings.clearData'), t('history.clearConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScreenHeader title={t('settings.title')} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoSection}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={[styles.appName, { color: c.accent }]}>{t('app.name')}</Text>
        </View>

        {/* Lõi AI — danh sách model động */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t('settings.aiGroup')}</Text>
        <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
          {AI_MODELS.map((m, i) => {
            const active = selectedModelId === m.id;
            return (
              <TouchableOpacity
                key={m.id}
                style={[styles.radioItem, { borderBottomColor: c.border }, i === AI_MODELS.length - 1 && styles.noBorder]}
                onPress={() => setSelectedModelId(m.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={active ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={c.accent}
                />
                <View style={styles.radioText}>
                  <Text style={[styles.radioLabel, { color: c.textPrimary }]}>{m.name}</Text>
                  <Text style={[styles.radioSub, { color: c.textSecondary }]}>
                    {t(m.descKey as any)} · {m.sizeLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ngưỡng nhạy */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t('settings.threshold')}</Text>
        <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border, padding: 16 }]}>
          <View style={styles.thresholdRow}>
            <Text style={[styles.thresholdVal, { color: c.accent }]}>
              {sensitivityThreshold.toFixed(2)}
            </Text>
            <View style={styles.stepBtns}>
              <StepBtn
                icon="remove"
                onPress={() => setSensitivityThreshold(Math.max(0.1, +(sensitivityThreshold - 0.1).toFixed(1)))}
                c={c}
              />
              <StepBtn
                icon="add"
                onPress={() => setSensitivityThreshold(Math.min(0.9, +(sensitivityThreshold + 0.1).toFixed(1)))}
                c={c}
              />
            </View>
          </View>
          {/* thanh mức đơn giản */}
          <View style={[styles.track, { backgroundColor: c.border }]}>
            <View
              style={[
                styles.trackFill,
                { backgroundColor: c.accent, width: `${((sensitivityThreshold - 0.1) / 0.8) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.hint, { color: c.textSecondary }]}>{t('settings.thresholdHint')}</Text>
        </View>

        {/* Dữ liệu */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t('settings.dataGroup')}</Text>
        <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
          <SwitchRow label={t('settings.saveThumb')} value={saveThumbnails} onChange={setSaveThumbnails} c={c} />
          <SwitchRow label={t('settings.blurWarn')} value={blurWarning} onChange={setBlurWarning} c={c} last />
        </View>
        <TouchableOpacity
          style={[styles.clearBtn, { borderColor: c.danger }]}
          onPress={confirmClear}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={18} color={c.danger} />
          <Text style={[styles.clearText, { color: c.danger }]}>{t('settings.clearData')}</Text>
        </TouchableOpacity>

        {/* Giao diện & ngôn ngữ */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>{t('settings.generalGroup')}</Text>
        <View style={[styles.box, { backgroundColor: c.surface, borderColor: c.border }]}>
          <SwitchRow
            label={t('settings.theme')}
            value={theme === 'dark'}
            onChange={toggleTheme}
            c={c}
          />
          <View style={[styles.langRow, { borderTopColor: c.border }]}>
            <Text style={[styles.switchLabel, { color: c.textPrimary }]}>{t('settings.language')}</Text>
            <View style={styles.langBtns}>
              <LangBtn code="vi" active={language === 'vi'} onPress={() => setLanguage('vi')} c={c} />
              <LangBtn code="EN" active={language === 'en'} onPress={() => setLanguage('en')} c={c} />
            </View>
          </View>
        </View>

        {/* Thông tin */}
        <TouchableOpacity
          style={[styles.infoBtn, { backgroundColor: c.accent }]}
          onPress={() => router.push('/history')}
        >
          <Ionicons name="time-outline" size={20} color={c.onAccent} />
          <Text style={[styles.infoBtnText, { color: c.onAccent }]}>{t('settings.history')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkItem, { borderBottomColor: c.border }]} onPress={() => router.push('/privacy')}>
          <Text style={[styles.linkText, { color: c.textSecondary }]}>{t('settings.privacy')}</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkItem, { borderBottomColor: c.border }]} onPress={() => router.push('/about')}>
          <Text style={[styles.linkText, { color: c.textSecondary }]}>{t('settings.about')}</Text>
          <Ionicons name="chevron-forward" size={18} color={c.textMuted} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function SwitchRow({ label, value, onChange, c, last }: any) {
  return (
    <View style={[styles.switchItem, { borderBottomColor: c.border }, last && styles.noBorder]}>
      <Text style={[styles.switchLabel, { color: c.textPrimary }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: c.border, true: c.accent }}
        thumbColor="#fff"
      />
    </View>
  );
}

function StepBtn({ icon, onPress, c }: any) {
  return (
    <TouchableOpacity style={[styles.stepBtn, { borderColor: c.accent }]} onPress={onPress}>
      <Ionicons name={icon} size={18} color={c.accent} />
    </TouchableOpacity>
  );
}

function LangBtn({ code, active, onPress, c }: any) {
  return (
    <TouchableOpacity
      style={[styles.langBtn, { borderColor: c.accent, backgroundColor: active ? c.accent : 'transparent' }]}
      onPress={onPress}
    >
      <Text style={{ color: active ? c.onAccent : c.accent, fontWeight: 'bold', fontSize: 13 }}>
        {code.toUpperCase()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingTop: 4 },
  logoSection: { alignItems: 'center', marginBottom: 24 },
  logo: { width: 64, height: 64, resizeMode: 'contain' },
  appName: { fontSize: 18, fontWeight: 'bold', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 14 },
  box: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 8 },
  radioItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, gap: 14 },
  radioText: { flex: 1 },
  radioLabel: { fontSize: 15, fontWeight: 'bold' },
  radioSub: { fontSize: 12, marginTop: 2 },
  noBorder: { borderBottomWidth: 0 },
  thresholdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  thresholdVal: { fontSize: 26, fontWeight: 'bold' },
  stepBtns: { flexDirection: 'row', gap: 10 },
  stepBtn: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  track: { height: 6, borderRadius: 3, marginTop: 14, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 3 },
  hint: { fontSize: 12, marginTop: 10, lineHeight: 17 },
  switchItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  switchLabel: { fontSize: 15 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  clearText: { fontWeight: 'bold', fontSize: 14 },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderTopWidth: 1 },
  langBtns: { flexDirection: 'row', gap: 8 },
  langBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1 },
  infoBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 15, borderRadius: 10, marginTop: 14 },
  infoBtnText: { fontWeight: 'bold', fontSize: 15 },
  linkItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  linkText: { fontSize: 14 },
});
