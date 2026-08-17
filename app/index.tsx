import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from './_theme/useTheme';
import { useT } from './_i18n/useT';
import { useAppStore } from './_store/appStore';
import { getModelById } from './_config/models';

export default function HomeScreen() {
  const c = useTheme();
  const t = useT();
  const router = useRouter();

  const onboarded = useAppStore((s) => s.onboarded);
  const media = useAppStore((s) => s.selectedMedia);
  const setMedia = useAppStore((s) => s.setSelectedMedia);
  const modelId = useAppStore((s) => s.selectedModelId);
  const model = getModelById(modelId);

  const [showPrivacy, setShowPrivacy] = useState(false);

  // Lần đầu mở app -> sang onboarding
  useEffect(() => {
    if (!onboarded) router.replace('/onboarding');
  }, [onboarded]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!res.canceled) setMedia({ uri: res.assets[0].uri, type: 'image' });
  };

  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      quality: 1,
    });
    if (!res.canceled) setMedia({ uri: res.assets[0].uri, type: 'video' });
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!res.canceled) setMedia({ uri: res.assets[0].uri, type: 'image' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.bg }]}>
      {/* Modal cam kết bảo mật */}
      <Modal visible={showPrivacy} transparent animationType="fade">
        <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: c.surface, borderColor: c.accent }]}>
            <Text style={[styles.modalTitle, { color: c.accent }]}>
              🔒 {t('home.privacyTitle')}
            </Text>
            <Text style={[styles.modalText, { color: c.textPrimary }]}>
              {t('home.privacyText')}
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, { backgroundColor: c.accent }]}
              onPress={() => setShowPrivacy(false)}
            >
              <Text style={[styles.btnPrimaryText, { color: c.onAccent }]}>
                {t('common.agree')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btnSecondary, { borderColor: c.accent }]}
              onPress={() => {
                setShowPrivacy(false);
                router.push('/privacy');
              }}
            >
              <Text style={[styles.btnSecondaryText, { color: c.accent }]}>
                {t('common.details')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Header — CHỈ 1 icon settings bên phải */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Image source={require('../assets/logo.png')} style={styles.logo} />
          <Text style={[styles.headerTitle, { color: c.accent }]}>{t('app.name')}</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => router.push('/settings')}
          hitSlop={10}
        >
          <Ionicons name="settings-outline" size={28} color={c.accent} />
        </TouchableOpacity>
      </View>

      {/* Badge model đang chọn (động) */}
      <TouchableOpacity
        style={[styles.badge, { borderColor: c.accent }]}
        onPress={() => router.push('/settings')}
      >
        <Ionicons name="hardware-chip-outline" size={16} color={c.accent} />
        <Text style={[styles.badgeText, { color: c.accent }]}>
          {model.name}
        </Text>
      </TouchableOpacity>

      {/* Khung preview */}
      <View style={[styles.imageBox, { borderColor: c.accent }]}>
        {media ? (
          <>
            <Image source={{ uri: media.uri }} style={styles.preview} />
            {media.type === 'video' && (
              <View style={styles.videoTag}>
                <Ionicons name="videocam" size={14} color={c.onAccent} />
              </View>
            )}
          </>
        ) : (
          <Text style={[styles.placeholder, { color: c.accent }]}>
            {t('home.placeholder')}
          </Text>
        )}
      </View>

      {/* Nút chọn nguồn */}
      <View style={styles.sourceRow}>
        <SourceBtn icon="camera" label={t('home.takePhoto')} onPress={takePhoto} c={c} />
        <SourceBtn icon="image" label={t('home.pickImage')} onPress={pickImage} c={c} />
        <SourceBtn icon="videocam" label={t('home.pickVideo')} onPress={pickVideo} c={c} />
      </View>

      {/* Nút phân tích */}
      <TouchableOpacity
        style={[
          styles.analyze,
          { backgroundColor: media ? c.accent : c.textMuted },
        ]}
        disabled={!media}
        onPress={() => router.push('/prepare')}
        activeOpacity={0.85}
      >
        <Ionicons name="rocket" size={20} color={c.onAccent} />
        <Text style={[styles.analyzeText, { color: c.onAccent }]}>{t('home.analyze')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function SourceBtn({
  icon,
  label,
  onPress,
  c,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  c: ReturnType<typeof useTheme>;
}) {
  return (
    <TouchableOpacity
      style={[styles.sourceBtn, { backgroundColor: c.surface, borderColor: c.accent }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={22} color={c.accent} />
      <Text style={[styles.sourceText, { color: c.accent }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { width: '100%', marginTop: 12, marginBottom: 20 },
  headerCenter: { alignItems: 'center' },
  settingsIcon: { position: 'absolute', top: 0, right: 0, padding: 5 },
  logo: { width: 76, height: 76, resizeMode: 'contain' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
    marginBottom: 24,
  },
  badgeText: { fontWeight: 'bold', fontSize: 13 },
  imageBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(234,88,12,0.9)',
    borderRadius: 20,
    padding: 6,
  },
  placeholder: { textAlign: 'center', opacity: 0.75, lineHeight: 22 },
  sourceRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  sourceBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  sourceText: { fontWeight: 'bold', fontSize: 12 },
  analyze: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderRadius: 12,
  },
  analyzeText: { fontWeight: 'bold', fontSize: 17 },
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalBox: { width: '90%', padding: 24, borderRadius: 16, borderWidth: 1 },
  modalTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 14, textAlign: 'center' },
  modalText: { fontSize: 14, lineHeight: 22, marginBottom: 22, textAlign: 'center' },
  btnPrimary: { padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
  btnPrimaryText: { fontWeight: 'bold', fontSize: 15 },
  btnSecondary: { padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  btnSecondaryText: { fontWeight: 'bold', fontSize: 15 },
});
