import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../_theme/useTheme';

interface Props {
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  rightColor?: string;
}

// Header chuẩn: nút back trái, tiêu đề giữa, icon tùy chọn bên phải.
export default function ScreenHeader({ title, rightIcon, onRightPress, rightColor }: Props) {
  const router = useRouter();
  const c = useTheme();
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
        <Ionicons name="arrow-back" size={28} color={c.accent} />
      </TouchableOpacity>
      <Text style={[styles.title, { color: c.textPrimary }]}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={26} color={rightColor ?? c.accent} />
        </TouchableOpacity>
      ) : (
        <View style={{ width: 28 }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
});
