import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import ScreenHeader from './_components/ScreenHeader';

export default function PrivacyScreen() {
  const c = useTheme();
  const t = useT();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScreenHeader title={t('privacy.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.text, { color: c.textSecondary }]}>{t('privacy.body')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  text: { fontSize: 15, lineHeight: 26 },
});
