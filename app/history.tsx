import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import { getModelById } from './_config/models';

export default function HistoryScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();
  const history = useAppStore((s) => s.history);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const removeFromHistory = useAppStore((s) => s.removeFromHistory);

  const confirmClear = () => {
    if (history.length === 0) return;
    Alert.alert(t('history.title'), t('history.clearConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: 'OK', style: 'destructive', onPress: clearHistory },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={28} color={c.accent} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: c.textPrimary }]}>{t('history.title')}</Text>
        <TouchableOpacity onPress={confirmClear} hitSlop={10}>
          <Ionicons name="trash-outline" size={24} color={c.danger} />
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={80} color={c.border} />
          <Text style={[styles.emptyText, { color: c.textMuted }]}>{t('history.empty')}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
          renderItem={({ item }) => {
            const verdictColor = item.isFake ? c.danger : c.success;
            const model = getModelById(item.modelId);
            return (
              <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
                <Image source={{ uri: item.mediaUri }} style={styles.thumb} />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardDate, { color: c.textSecondary }]}>{item.date}</Text>
                  <Text style={[styles.cardStatus, { color: verdictColor }]}>
                    {item.isFake ? t('result.fake') : t('result.real')}
                  </Text>
                  <Text style={[styles.cardModel, { color: c.textMuted }]}>{model.name}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.cardScore, { color: c.accent }]}>{item.score}</Text>
                  <TouchableOpacity onPress={() => removeFromHistory(item.id)} hitSlop={8}>
                    <Ionicons name="close-circle" size={20} color={c.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16, marginTop: 15 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  thumb: { width: 52, height: 52, borderRadius: 8 },
  cardInfo: { flex: 1, marginLeft: 14 },
  cardDate: { fontSize: 12 },
  cardStatus: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },
  cardModel: { fontSize: 11, marginTop: 2 },
  cardRight: { alignItems: 'center', gap: 6 },
  cardScore: { fontSize: 20, fontWeight: 'bold' },
});
