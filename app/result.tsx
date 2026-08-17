import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import { getModelById } from './_config/models';

export default function ResultScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();

  const media = useAppStore((s) => s.selectedMedia);
  const result = useAppStore((s) => s.analysisResult);
  const resetAnalysis = useAppStore((s) => s.resetAnalysis);

  const goBack = () => { resetAnalysis(); router.replace('/'); };

  if (!result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
        <View style={styles.center}><Text style={{ color: c.textSecondary }}>—</Text></View>
      </SafeAreaView>
    );
  }

  const model = getModelById(result.modelId);

  // 3 trạng thái: fake / uncertain / real  (uncertain khi confidence = 'Không chắc chắn')
  const isUncertain = result.confidence === 'Không chắc chắn';
  const verdictColor = isUncertain ? c.accent : result.isFake ? c.danger : c.success;
  const verdictText = isUncertain
    ? 'KHÔNG CHẮC CHẮN'
    : result.isFake ? t('result.fake') : t('result.real');
  const verdictIcon = isUncertain
    ? 'help-circle'
    : result.isFake ? 'alert-circle' : 'checkmark-circle';

  // % fake và % thật (thật = 100 - fake)
  const fakePct = Math.round(result.fakeProbability * 100);
  const realPct = 100 - fakePct;

  const shareReport = async () => {
    const report =
      `DeepGuard — Kết quả phân tích\n` +
      `Phán quyết: ${verdictText}\n` +
      `Xác suất Deepfake: ${fakePct}%  |  Thật: ${realPct}%\n` +
      `Độ tin cậy: ${result.confidence}\n` +
      `Mô hình: ${model.name}\n` +
      `Thời gian suy luận: ${(result.latencyMs / 1000).toFixed(1)}s`;
    try { await Share.share({ message: report }); } catch {}
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} hitSlop={10}>
            <Ionicons name="arrow-back" size={28} color={c.accent} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('app.name')}</Text>
          <TouchableOpacity onPress={shareReport} hitSlop={10}>
            <Ionicons name="share-social-outline" size={26} color={c.accent} />
          </TouchableOpacity>
        </View>

        {/* Ảnh + badge */}
        <View style={styles.imageWrap}>
          <View style={[styles.imageBox, { borderColor: c.border }]}>
            {media ? <Image source={{ uri: media.uri }} style={styles.preview} />
                   : <Text style={{ color: c.textSecondary }}>—</Text>}
          </View>
          <View style={[styles.badge, { backgroundColor: verdictColor }]}>
            <Ionicons name={verdictIcon as any} size={16} color={c.onAccent} />
            <Text style={[styles.badgeText, { color: c.onAccent }]}>{verdictText}</Text>
          </View>
        </View>

        {/* Vòng tròn % Deepfake (số thật từ model) */}
        <View style={styles.scoreWrap}>
          <View style={[styles.circle, { borderColor: verdictColor }]}>
            <Text style={[styles.score, { color: verdictColor }]}>
              {fakePct}<Text style={[styles.scoreSub, { color: verdictColor }]}>%</Text>
            </Text>
            <Text style={[styles.scoreCaption, { color: c.textSecondary }]}>Deepfake</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: c.textSecondary }]}>
            Độ tin cậy: {result.confidence}
          </Text>
        </View>

        {/* Thanh xác suất Thật vs Giả */}
        <View style={styles.barWrap}>
          <View style={styles.barLabels}>
            <Text style={[styles.barLabel, { color: c.success }]}>Thật {realPct}%</Text>
            <Text style={[styles.barLabel, { color: c.danger }]}>Giả {fakePct}%</Text>
          </View>
          <View style={[styles.bar, { backgroundColor: c.danger }]}>
            <View style={[styles.barFill, { backgroundColor: c.success, width: `${realPct}%` }]} />
          </View>
        </View>

        {isUncertain && (
          <View style={[styles.warnBox, { backgroundColor: c.surface, borderColor: c.accent }]}>
            <Ionicons name="information-circle-outline" size={18} color={c.accent} />
            <Text style={[styles.warnText, { color: c.textPrimary }]}>
              Mô hình không đủ chắc chắn để kết luận. Hãy thử ảnh rõ hơn, chính diện.
            </Text>
          </View>
        )}

        {/* Bảng kỹ thuật - chỉ số THẬT */}
        <View style={[styles.techBox, { backgroundColor: c.accent }]}>
          <View style={styles.techHeader}>
            <Ionicons name="bar-chart" size={20} color={c.onAccent} />
            <Text style={[styles.techTitle, { color: c.onAccent }]}>{t('result.techTitle')}</Text>
          </View>
          <View style={styles.grid}>
            <Cell icon="shield-checkmark-outline" label="Xác suất thật" value={`${realPct}%`} c={c} />
            <Cell icon="warning-outline" label="Xác suất giả" value={`${fakePct}%`} c={c} />
            <Cell icon="hardware-chip-outline" label="Mô hình" value={model.family} c={c} />
            <Cell icon="timer-outline" label="Thời gian" value={`${(result.latencyMs / 1000).toFixed(1)}s`} c={c} />
            <Cell icon="thumbs-up-outline" label="Độ tin cậy" value={result.confidence} c={c} full />
          </View>
        </View>

        {/* Nút */}
        <TouchableOpacity style={[styles.shareBtn, { backgroundColor: c.accent }]} onPress={shareReport} activeOpacity={0.85}>
          <Ionicons name="share-social" size={18} color={c.onAccent} />
          <Text style={[styles.shareText, { color: c.onAccent }]}>{t('result.share')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.scanBtn, { backgroundColor: c.surface, borderColor: c.border }]} onPress={goBack} activeOpacity={0.85}>
          <Ionicons name="refresh" size={18} color={c.textPrimary} />
          <Text style={[styles.scanText, { color: c.textPrimary }]}>{t('result.scanAgain')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function Cell({ icon, label, value, c, full }: any) {
  return (
    <View style={[styles.cell, { backgroundColor: c.accentDark, width: full ? '100%' : '48%' }]}>
      <Ionicons name={icon} size={22} color={c.onAccent} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.cellLabel, { color: c.accentSoft }]}>{label}</Text>
        <Text style={[styles.cellValue, { color: c.onAccent }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  imageWrap: { alignItems: 'center', marginBottom: 26 },
  imageBox: { width: 200, height: 260, borderRadius: 20, overflow: 'hidden', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginTop: -18, elevation: 5 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
  scoreWrap: { alignItems: 'center', marginBottom: 20 },
  circle: { width: 130, height: 130, borderRadius: 65, borderWidth: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  score: { fontSize: 34, fontWeight: 'bold' },
  scoreSub: { fontSize: 18 },
  scoreCaption: { fontSize: 12, marginTop: 2 },
  scoreLabel: { fontSize: 14, textAlign: 'center' },
  barWrap: { width: '100%', marginBottom: 22 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { fontSize: 13, fontWeight: 'bold' },
  bar: { height: 12, borderRadius: 6, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 6 },
  warnBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, width: '100%', marginBottom: 20 },
  warnText: { flex: 1, fontSize: 13, lineHeight: 18 },
  techBox: { width: '100%', borderRadius: 16, padding: 18, marginBottom: 24 },
  techHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  techTitle: { fontSize: 18, fontWeight: 'bold' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  cell: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10 },
  cellLabel: { fontSize: 12, marginBottom: 3 },
  cellValue: { fontSize: 15, fontWeight: 'bold' },
  shareBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 15, borderRadius: 12, width: '100%', marginBottom: 12 },
  shareText: { fontWeight: 'bold', fontSize: 16 },
  scanBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 15, borderRadius: 12, borderWidth: 1, width: '100%' },
  scanText: { fontWeight: 'bold', fontSize: 16 },
});
