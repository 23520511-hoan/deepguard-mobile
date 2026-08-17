// ============================================================================
//  CẤU HÌNH MODEL TFLITE — chỉ chứa THÔNG SỐ (shape, chuẩn hóa, ngưỡng).
//  Việc require file .tflite nằm trong tfliteEngine.ts (Metro cần require tĩnh).
//  Thông số dưới đây đọc trực tiếp từ file thật (msfv_lstm.tflite):
//    input : [1, 12, 224, 224, 3] float32  (NHWC, 12 frame, 224x224)
//    output: [1] float32  -> LOGIT (code tự sigmoid)
// ============================================================================

export interface TFLiteModelSpec {
  id: string;
  numFrames: number; // số frame model cần (T)
  inputSize: number; // cạnh ảnh (224)
  channels: number; // 3 (RGB)
  normalize: 'zero_one' | 'minus_one_one'; // [0,1] hay [-1,1]
  outputType: 'logit' | 'probability'; // logit cần sigmoid
  threshold: number; // ngưỡng phân loại fake (xác suất 0..1)
}

export const MODEL_SPECS: Record<string, TFLiteModelSpec> = {
  'msfv-lstm-wild': {
    id: 'msfv-lstm-wild',
    numFrames: 12,
    inputSize: 224,
    channels: 3,
    normalize: 'zero_one',
    outputType: 'logit',
    threshold: 0.5,
  },
};

export function getSpec(modelId: string): TFLiteModelSpec | null {
  return MODEL_SPECS[modelId] ?? null;
}
