import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import { analyzeMedia, NoFaceError, MultiFaceError } from './_services/analyzer';

export default function ProcessingScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();

  const media = useAppStore((s) => s.selectedMedia);
  const modelId = useAppStore((s) => s.selectedModelId);
  const threshold = useAppStore((s) => s.sensitivityThreshold);
  const setResult = useAppStore((s) => s.setAnalysisResult);
  const addToHistory = useAppStore((s) => s.addToHistory);

  const [step, setStep] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  const steps = [
    { key: t('processing.step1'), pct: 0.2 },
    { key: t('processing.step2'), pct: 0.6 },
    { key: t('processing.step3'), pct: 0.85 },
    { key: t('processing.step4'), pct: 1 },
  ];

  useEffect(() => {
    if (!media) { router.replace('/'); return; }
    let cancelled = false;

    const timers: ReturnType<typeof setTimeout>[] = [];
    steps.forEach((s, i) => {
      timers.push(setTimeout(() => {
        if (cancelled) return;
        setStep(i);
        Animated.timing(progress, { toValue: s.pct, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
      }, i * 620));
    });

    analyzeMedia(media.uri, media.type, modelId, threshold)
      .then((result) => {
        if (cancelled) return;
        setResult(result);
        addToHistory({
          id: Math.random().toString(36).slice(2),
          date: new Date().toLocaleString(),
          mediaUri: media.uri, mediaType: media.type,
          score: result.score, isFake: result.isFake, modelId: result.modelId,
        });
        router.replace('/result');
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof NoFaceError) {
          Alert.alert(t('error.noFaceTitle'), t('error.noFaceBody'), [
            { text: t('common.continue'), onPress: () => router.replace('/') },
          ]);
        } else if (err instanceof MultiFaceError) {
          Alert.alert(t('error.multiFaceTitle'), t('error.multiFaceBody'), [
            { text: t('common.continue'), onPress: () => router.replace('/') },
          ]);
        } else {
          Alert.alert(t('error.genericTitle'), t('error.genericBody'), [
            { text: t('common.continue'), onPress: () => router.replace('/') },
          ]);
        }
      });

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [media]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ActivityIndicator size="large" color={c.accent} />
      <Text style={[styles.title, { color: c.accent }]}>{t('processing.title')}</Text>
      <Text style={[styles.sub, { color: c.textSecondary }]}>{t('processing.sub')}</Text>
      <View style={[styles.barBg, { backgroundColor: c.surface }]}>
        <Animated.View style={[styles.barFill, { width, backgroundColor: c.accent }]} />
      </View>
      <View style={styles.steps}>
        {steps.map((s, i) => {
          const done = i < step; const active = i === step;
          return (
            <View key={i} style={styles.stepRow}>
              <Ionicons name={done ? 'checkmark-circle' : active ? 'ellipse' : 'ellipse-outline'} size={18} color={done || active ? c.accent : c.textMuted} />
              <Text style={[styles.stepText, { color: done || active ? c.textPrimary : c.textMuted }]}>{s.key}</Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  title: { fontSize: 20, fontWeight: 'bold', marginTop: 24 },
  sub: { fontSize: 14, marginTop: 12, textAlign: 'center', lineHeight: 22 },
  barBg: { width: '100%', height: 8, borderRadius: 4, marginTop: 34, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  steps: { width: '100%', marginTop: 26, gap: 14 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepText: { fontSize: 14 },
});
