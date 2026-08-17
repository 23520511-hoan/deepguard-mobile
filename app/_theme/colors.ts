// Bảng màu 2 theme. Mọi màn hình lấy màu từ đây qua useTheme(),
// KHÔNG hard-code màu trong StyleSheet.

export interface ThemeColors {
  bg: string; // nền chính
  surface: string; // nền thẻ / khối
  surfaceAlt: string; // nền phụ (ô grid...)
  border: string; // viền
  accent: string; // màu nhấn (cam)
  accentDark: string; // cam đậm (nền ô trong bảng kỹ thuật)
  accentSoft: string; // cam nhạt (label trong bảng kỹ thuật)
  textPrimary: string; // chữ chính
  textSecondary: string; // chữ phụ
  textMuted: string; // chữ mờ (footer...)
  success: string; // xanh (REAL)
  danger: string; // đỏ (FAKE / xóa)
  overlay: string; // nền mờ modal
  onAccent: string; // chữ trên nền cam
}

const accent = '#ea580c';

export const darkColors: ThemeColors = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceAlt: '#7c2d12',
  border: '#334155',
  accent,
  accentDark: '#7c2d12',
  accentSoft: '#fdba74',
  textPrimary: '#cbd5e1',
  textSecondary: '#94a3b8',
  textMuted: '#475569',
  success: '#10b981',
  danger: '#ef4444',
  overlay: 'rgba(0,0,0,0.8)',
  onAccent: '#ffffff',
};

export const lightColors: ThemeColors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceAlt: '#fff1e9',
  border: '#e2e8f0',
  accent,
  accentDark: '#c2410c',
  accentSoft: '#9a3412',
  textPrimary: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  success: '#059669',
  danger: '#dc2626',
  overlay: 'rgba(15,23,42,0.55)',
  onAccent: '#ffffff',
};

export const themes = { dark: darkColors, light: lightColors };
