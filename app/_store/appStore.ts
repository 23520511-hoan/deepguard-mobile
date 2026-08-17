import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AnalysisResult,
  HistoryItem,
  Language,
  SelectedMedia,
  ThemeMode,
} from '../_types';
import { DEFAULT_MODEL_ID } from '../_config/models';

interface AppState {
  // media đang phân tích
  selectedMedia: SelectedMedia | null;
  setSelectedMedia: (media: SelectedMedia | null) => void;
  clearSelectedMedia: () => void;

  // kết quả
  analysisResult: AnalysisResult | null;
  setAnalysisResult: (result: AnalysisResult | null) => void;

  // lịch sử
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // cấu hình AI
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  sensitivityThreshold: number;
  setSensitivityThreshold: (v: number) => void;

  // dữ liệu
  saveThumbnails: boolean;
  setSaveThumbnails: (v: boolean) => void;
  blurWarning: boolean;
  setBlurWarning: (v: boolean) => void;

  // giao diện
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  language: Language;
  setLanguage: (l: Language) => void;

  // onboarding đã xem chưa
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;

  resetAnalysis: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      selectedMedia: null,
      setSelectedMedia: (media) => set({ selectedMedia: media }),
      clearSelectedMedia: () => set({ selectedMedia: null }),

      analysisResult: null,
      setAnalysisResult: (result) => set({ analysisResult: result }),

      history: [],
      addToHistory: (item) =>
        set((s) => ({ history: [item, ...s.history].slice(0, 100) })),
      removeFromHistory: (id) =>
        set((s) => ({ history: s.history.filter((h) => h.id !== id) })),
      clearHistory: () => set({ history: [] }),

      selectedModelId: DEFAULT_MODEL_ID,
      setSelectedModelId: (id) => set({ selectedModelId: id }),
      sensitivityThreshold: 0.5,
      setSensitivityThreshold: (v) => set({ sensitivityThreshold: v }),

      saveThumbnails: true,
      setSaveThumbnails: (v) => set({ saveThumbnails: v }),
      blurWarning: true,
      setBlurWarning: (v) => set({ blurWarning: v }),

      theme: 'dark',
      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      language: 'vi',
      setLanguage: (l) => set({ language: l }),

      onboarded: false,
      setOnboarded: (v) => set({ onboarded: v }),

      resetAnalysis: () => set({ selectedMedia: null, analysisResult: null }),
    }),
    {
      name: 'deepguard-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // chỉ lưu lâu dài những cái này; media & result reset mỗi phiên
      partialize: (s) => ({
        history: s.history,
        selectedModelId: s.selectedModelId,
        sensitivityThreshold: s.sensitivityThreshold,
        saveThumbnails: s.saveThumbnails,
        blurWarning: s.blurWarning,
        theme: s.theme,
        language: s.language,
        onboarded: s.onboarded,
      }),
    }
  )
);
