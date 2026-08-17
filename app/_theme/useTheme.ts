import { useAppStore } from '../_store/appStore';
import { themes, ThemeColors } from './colors';

// Trả về bảng màu theo theme hiện tại trong store.
export function useTheme(): ThemeColors {
  const theme = useAppStore((s) => s.theme);
  return themes[theme];
}
