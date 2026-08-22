import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import { analyzeMedia, NoFaceError, MultiFaceError, VideoNoFaceError } from './_services/analyzer';

export default function ProcessingScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();

  const media = useAppStore((s) => s.selectedMedia);
  const modelId = useAppStore((s) => s.selectedModelId);
  const threshold = useAppStore((s) => s.sensitivityThreshold);
  const setResult = useAppStore((s) => s.setAnalysisResult);
  const addToHistory = useAppStore((s) => s.addToHistory);

  const isVideo = media?.type === 'video';
  const [step, setStep] = useState(0);
  const [frameProg, setFrameProg] = useState<{ done: number; total: number } | null>(null);
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
    // Ảnh: chạy animation 4 bước. Video: bước tiến theo khung thật (bên dưới).
    if (!isVideo) {
      steps.forEach((s, i) => {
        timers.push(setTimeout(() => {
          if (cancelled) return;
          setStep(i);
          Animated.timing(progress, { toValue: s.pct, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
        }, i * 620));
      });
    }

    const onProgress = (done: number, total: number) => {
      if (cancelled) return;
      setFrameProg({ done, total });
      const pct = total > 0 ? done / total : 0;
      Animated.timing(progress, { toValue: pct, duration: 200, useNativeDriver: false }).start();
    };

    analyzeMedia(media.uri, media.type, modelId, threshold, onProgress)
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
        const goHome = () => router.replace('/');
        if (err instanceof NoFaceError) {
          Alert.alert(t('error.noFaceTitle'), t('error.noFaceBody'), [{ text: t('common.continue'), onPress: goHome }]);
        } else if (err instanceof MultiFaceError) {
          Alert.alert(t('error.multiFaceTitle'), t('error.multiFaceBody'), [{ text: t('common.continue'), onPress: goHome }]);
        } else if (err instanceof VideoNoFaceError) {
          Alert.alert(t('error.videoNoFaceTitle'), t('error.videoNoFaceBody'), [{ text: t('common.continue'), onPress: goHome }]);
        } else {
          Alert.alert(t('error.genericTitle'), t('error.genericBody'), [{ text: t('common.continue'), onPress: goHome }]);
        }
      });

    return () => { cancelled = true; timers.forEach(clearTimeout); };
  }, [media]);

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ActivityIndicator size="large" color={c.accent} />
      <Text style={[styles.title, { color: c.accent }]}>{t('processing.title')}</Text>

      {isVideo && frameProg ? (
        <Text style={[styles.sub, { color: c.textSecondary }]}>
          {t('processing.videoSub')} {frameProg.done}/{frameProg.total}
        </Text>
      ) : (
        <Text style={[styles.sub, { color: c.textSecondary }]}>{t('processing.sub')}</Text>
      )}

      <View style={[styles.barBg, { backgroundColor: c.surface }]}>
        <Animated.View style={[styles.barFill, { width, backgroundColor: c.accent }]} />
      </View>

      {!isVideo && (
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
      )}

      {isVideo && (
        <Text style={[styles.videoNote, { color: c.textMuted }]}>
          {t('processing.videoNote')}
        </Text>
      )}
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
  videoNote: { fontSize: 12, marginTop: 24, textAlign: 'center', lineHeight: 18 },
});
