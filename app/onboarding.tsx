import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';

export default function OnboardingScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();
  const setOnboarded = useAppStore((s) => s.setOnboarded);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      // 1) Popup xin quyền THƯ VIỆN ảnh/video
      const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
      // 2) Popup xin quyền CAMERA
      const cam = await ImagePicker.requestCameraPermissionsAsync();

      // Nếu người dùng từ chối hẳn (không hỏi lại nữa) -> hướng dẫn mở Cài đặt
      const libBlocked = !lib.granted && !lib.canAskAgain;
      const camBlocked = !cam.granted && !cam.canAskAgain;
      if (libBlocked || camBlocked) {
        Alert.alert(
          t('onboard.permTitle'),
          t('onboard.permDenied'),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('onboard.openSettings'), onPress: () => Linking.openSettings() },
          ]
        );
      }
    } catch {
      // vẫn cho vào app dù có lỗi quyền; user cấp lại sau khi chọn ảnh
    } finally {
      setLoading(false);
      setOnboarded(true);
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={styles.top}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={[styles.name, { color: c.accent }]}>{t('app.name')}</Text>
        <Text style={[styles.slogan, { color: c.textSecondary }]}>{t('onboard.slogan')}</Text>
      </View>

      <View style={[styles.permBox, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.permTitle, { color: c.textPrimary }]}>{t('onboard.permTitle')}</Text>
        <Row icon="camera-outline" text={t('onboard.permCamera')} c={c} />
        <Row icon="images-outline" text={t('onboard.permLibrary')} c={c} />
        <View style={styles.privacyRow}>
          <Ionicons name="lock-closed" size={16} color={c.accent} />
          <Text style={[styles.privacyLine, { color: c.textSecondary }]}>
            {t('onboard.privacyLine')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: c.accent, opacity: loading ? 0.7 : 1 }]}
        onPress={handleStart}
        activeOpacity={0.85}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={c.onAccent} />
        ) : (
          <Text style={[styles.btnText, { color: c.onAccent }]}>{t('onboard.start')}</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function Row({ icon, text, c }: { icon: any; text: string; c: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.permRow}>
      <Ionicons name={icon} size={22} color={c.accent} />
      <Text style={[styles.permText, { color: c.textPrimary }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'space-between' },
  top: { alignItems: 'center', marginTop: 40 },
  logo: { width: 130, height: 130, resizeMode: 'contain' },
  name: { fontSize: 30, fontWeight: 'bold', marginTop: 16 },
  slogan: { fontSize: 15, textAlign: 'center', marginTop: 10, lineHeight: 22, paddingHorizontal: 10 },
  permBox: { borderRadius: 16, borderWidth: 1, padding: 20 },
  permTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
  permRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 12 },
  permText: { fontSize: 14, flex: 1 },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  privacyLine: { fontSize: 12, flex: 1, lineHeight: 18 },
  btn: { padding: 18, borderRadius: 12, alignItems: 'center', minHeight: 58, justifyContent: 'center' },
  btnText: { fontSize: 17, fontWeight: 'bold' },
});
