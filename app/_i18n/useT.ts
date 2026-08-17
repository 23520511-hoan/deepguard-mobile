import { useAppStore } from '../_store/appStore';
import { vi, TranslationKey } from './vi';
import { en } from './en';

const dict = { vi, en };

// Trả hàm t(key) dịch theo ngôn ngữ hiện tại trong store.
export function useT() {
  const language = useAppStore((s) => s.language);
  const table = dict[language];
  return (key: TranslationKey): string => table[key] ?? key;
}
