import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import ScreenHeader from './_components/ScreenHeader';

export default function AboutScreen() {
  const c = useTheme();
  const t = useT();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScreenHeader title={t('about.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={[styles.appName, { color: c.accent }]}>{t('app.name')} v2.0</Text>
        <Text style={[styles.desc, { color: c.textSecondary }]}>{t('about.desc')}</Text>

        <View style={[styles.disclaimerBox, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Ionicons name="information-circle-outline" size={20} color={c.accent} />
          <Text style={[styles.disclaimer, { color: c.textSecondary }]}>{t('about.disclaimer')}</Text>
        </View>

        <Text style={[styles.footer, { color: c.textMuted }]}>{t('about.footer')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { alignItems: 'center', padding: 30, paddingTop: 30 },
  logo: { width: 110, height: 110, resizeMode: 'contain', marginBottom: 16 },
  appName: { fontSize: 22, fontWeight: 'bold', marginBottom: 18 },
  desc: { textAlign: 'center', lineHeight: 24, fontSize: 15 },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  disclaimer: { flex: 1, fontSize: 13, lineHeight: 20 },
  footer: { fontSize: 12, marginTop: 40 },
});
