import { AIModelConfig } from '../_types';

// DANH SÁCH MODEL hiển thị ở Settings. Thêm/bớt chỉ sửa ở đây.
// LƯU Ý: mỗi model ở đây nên có 'id' KHỚP với MODEL_SPECS trong modelSpecs.ts
// (nơi khai báo shape/threshold thật của file .tflite).
export const AI_MODELS: AIModelConfig[] = [
  {
    id: 'msfv-lstm-wild',
    name: 'MSFV-LSTM (Wild)',
    family: 'MSFV-LSTM',
    sizeLabel: '1.2 MB',
    precision: 'FP32',
    descKey: 'model.msfv_lstm_wild.desc',
  },
  // Khi train xong model khác, thêm vào đây, ví dụ:
  // { id: 'msfv-lstm-dfdc', name: 'MSFV-LSTM (DFDC)', family: 'MSFV-LSTM',
  //   sizeLabel: '1.2 MB', precision: 'FP32', descKey: 'model.msfv_lstm_dfdc.desc' },
];

export const DEFAULT_MODEL_ID = AI_MODELS[0].id;

export function getModelById(id: string): AIModelConfig {
  return AI_MODELS.find((m) => m.id === id) ?? AI_MODELS[0];
}
