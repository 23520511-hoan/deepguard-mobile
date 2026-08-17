import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import ScreenHeader from './_components/ScreenHeader';

export default function PrepareScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();
  const media = useAppStore((s) => s.selectedMedia);

  useEffect(() => {
    if (!media) router.replace('/');
  }, [media]);

  if (!media) return null;

  const isVideo = media.type === 'video';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <ScreenHeader title={t('prepare.title')} />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Preview media + khung mặt (mock) */}
        <View style={[styles.previewWrap, { borderColor: c.border }]}>
          <Image source={{ uri: media.uri }} style={styles.preview} />
          <View style={[styles.faceBox, { borderColor: c.accent }]} />
          {/* Nhãn loại media */}
          <View style={[styles.typeTag, { backgroundColor: c.accent }]}>
            <Ionicons name={isVideo ? 'videocam' : 'image'} size={13} color={c.onAccent} />
            <Text style={[styles.typeTagText, { color: c.onAccent }]}>
              {isVideo ? 'VIDEO' : 'ẢNH'}
            </Text>
          </View>
        </View>

        <View style={[styles.faceTag, { backgroundColor: c.surface, borderColor: c.success }]}>
          <Ionicons name="checkmark-circle" size={16} color={c.success} />
          <Text style={[styles.faceTagText, { color: c.success }]}>{t('prepare.faceFound')}</Text>
        </View>

        {/* Lưới 10 frame */}
        <Text style={[styles.sectionTitle, { color: c.textPrimary }]}>
          {t('prepare.framesTitle')}
        </Text>
        <Text style={[styles.hint, { color: c.textSecondary }]}>
          {isVideo ? t('prepare.framesHint') : t('prepare.framesHintImage')}
        </Text>
        <View style={styles.grid}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={[styles.frame, { borderColor: c.border }]}>
              <Image source={{ uri: media.uri }} style={styles.frameImg} />
              <View style={[styles.frameNum, { backgroundColor: c.accent }]}>
                <Text style={[styles.frameNumText, { color: c.onAccent }]}>{i + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.btn, { backgroundColor: c.accent }]}
        onPress={() => router.push('/processing')}
        activeOpacity={0.85}
      >
        <Ionicons name="flash" size={20} color={c.onAccent} />
        <Text style={[styles.btnText, { color: c.onAccent }]}>{t('prepare.start')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const FRAME_W = '18%';

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingTop: 4, alignItems: 'center' },
  previewWrap: {
    width: 200,
    height: 260,
    borderRadius: 18,
    borderWidth: 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  faceBox: {
    position: 'absolute',
    width: '55%',
    height: '45%',
    borderWidth: 2,
    borderRadius: 8,
    top: '18%',
  },
  typeTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  typeTagText: { fontSize: 10, fontWeight: 'bold' },
  faceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 16,
  },
  faceTagText: { fontWeight: 'bold', fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', alignSelf: 'flex-start', marginTop: 28 },
  hint: { fontSize: 13, alignSelf: 'flex-start', marginTop: 6, marginBottom: 14, lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start', width: '100%' },
  frame: {
    width: FRAME_W,
    aspectRatio: 0.8,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  frameImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  frameNum: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  frameNumText: { fontSize: 9, fontWeight: 'bold' },
  btn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 12,
    margin: 20,
    marginTop: 8,
  },
  btnText: { fontWeight: 'bold', fontSize: 16 },
});
