import { AIModelConfig } from '../_types';

// DANH SÁCH MODEL hiển thị ở Settings. id KHỚP với MODEL_SPECS + tfliteEngine.
// Phần tử ĐẦU TIÊN là mặc định khi mở app.
export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'tlcnn',
    name: 'TL-CNN (Nhanh)',
    family: 'TL-CNN',
    sizeLabel: '4.6 MB',
    precision: 'FP32',
    descKey: 'model.tlcnn.desc',
  },
  {
    id: 'unified-robust',
    name: 'Unified Robust',
    family: 'Unified',
    sizeLabel: '8.9 MB',
    precision: 'FP32',
    descKey: 'model.unified.desc',
  },
  {
    id: '3d-mobilenet',
    name: '3D-MobileNet (Nhẹ)',
    family: '3D-MobileNet',
    sizeLabel: '1.8 MB',
    precision: 'FP32',
    descKey: 'model.mobilenet.desc',
  },
  {
    id: 'msfv-lstm-wild',
    name: 'MSFV-LSTM (Wild)',
    family: 'MSFV-LSTM',
    sizeLabel: '2.5 MB',
    precision: 'FP32',
    descKey: 'model.msfv_lstm_wild.desc',
  },
];

export const DEFAULT_MODEL_ID = AI_MODELS[0].id;

export function getModelById(id: string): AIModelConfig {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}
