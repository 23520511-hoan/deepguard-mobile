// ============================================================================
//  CẤU HÌNH THÔNG SỐ MODEL TFLITE (đọc trực tiếp từ file thật)
//  numFrames=1  -> model nhận 1 ẢNH  [1,224,224,3]
//  numFrames>1  -> model nhận CHUỖI  [1,T,224,224,3]
//  outputType: 'logit' cần sigmoid; 'probability' đã là [0,1].
// ============================================================================

export interface TFLiteModelSpec {
  id: string;
  numFrames: number;   // 1 = ảnh đơn; >1 = chuỗi frame
  inputSize: number;   // 224
  channels: number;    // 3
  normalize: 'zero_one' | 'minus_one_one';
  outputType: 'logit' | 'probability';
  threshold: number;   // ngưỡng xác suất fake để kết luận
}

export const MODEL_SPECS: Record<string, TFLiteModelSpec> = {
  // 1 ẢNH - nhanh - MẶC ĐỊNH
  'tlcnn': {
    id: 'tlcnn', numFrames: 1, inputSize: 224, channels: 3,
    normalize: 'zero_one', outputType: 'probability', threshold: 0.5,
  },
  // 1 ẢNH - robust
  'unified-robust': {
    id: 'unified-robust', numFrames: 1, inputSize: 224, channels: 3,
    normalize: 'zero_one', outputType: 'probability', threshold: 0.5,
  },
  // 10 FRAME - nhẹ
  '3d-mobilenet': {
    id: '3d-mobilenet', numFrames: 10, inputSize: 224, channels: 3,
    normalize: 'zero_one', outputType: 'probability', threshold: 0.5,
  },
  // 12 FRAME - MSFV-LSTM Wild (logit)
  'msfv-lstm-wild': {
    id: 'msfv-lstm-wild', numFrames: 12, inputSize: 224, channels: 3,
    normalize: 'zero_one', outputType: 'logit', threshold: 0.5,
  },
};

export function getSpec(modelId: string): TFLiteModelSpec | null {
  return MODEL_SPECS[modelId] ?? null;
}
