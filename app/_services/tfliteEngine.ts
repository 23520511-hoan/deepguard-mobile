import { getSpec } from '../_config/modelSpecs';

declare const require: (name: string) => any;

// ============================================================================
//  TFLITE ENGINE — nạp & chạy nhiều model .tflite.
//  Cú pháp đúng: loadTensorflowModel(require('...'), [])  <- có [] delegate.
//  YÊU CẦU: metro.config.js có assetExts.push('tflite').
// ============================================================================

export const USE_REAL_MODEL = true;

// require TĨNH từng model (Metro cần require trực tiếp). id KHỚP models.ts.
const MODEL_REQUIRES: Record<string, any> = {
  'tlcnn': require('../../assets/models/model_tlcnn_optimized.tflite'),
  'unified-robust': require('../../assets/models/model_unified_robust.tflite'),
  '3d-mobilenet': require('../../assets/models/model_3d_mobilenet_optimized.tflite'),
  'msfv-lstm-wild': require('../../assets/models/msfv_lstm_float32.tflite'),
};

export interface RawInference { fakeProbability: number; latencyMs: number; }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }
const modelCache: Record<string, any> = {};

export async function runInference(modelId: string, input: Float32Array): Promise<RawInference> {
  const spec = getSpec(modelId);
  const modelRef = MODEL_REQUIRES[modelId];

  if (!USE_REAL_MODEL || !spec || !modelRef) {
    await new Promise((r) => setTimeout(r, 300));
    return { fakeProbability: Math.random(), latencyMs: 80 };
  }

  const tflite = require('react-native-fast-tflite');
  const t0 = Date.now();

  let model = modelCache[modelId];
  if (!model) {
    try {
      console.log('[TFLite] nạp model:', modelId);
      model = await tflite.loadTensorflowModel(modelRef, []);
      console.log('[TFLite] NẠP OK:', modelId);
    } catch (e: any) {
      console.log('[TFLite] LỖI NẠP', modelId, ':', e?.message || String(e));
      throw e;
    }
    modelCache[modelId] = model;
  }

  const inputBuffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  let outputs: any;
  try {
    if (typeof model.runSync === 'function') outputs = model.runSync([inputBuffer]);
    else outputs = await model.run([inputBuffer]);
  } catch (e: any) {
    console.log('[TFLite] LỖI RUN:', e?.message || String(e));
    throw e;
  }
  const out0 = new Float32Array(outputs[0]);
  const raw = out0[0];
  const prob = spec.outputType === 'logit' ? sigmoid(raw) : raw;
  console.log('[TFLite]', modelId, 'prob =', prob.toFixed(4), '|', Date.now() - t0, 'ms');
  return { fakeProbability: prob, latencyMs: Date.now() - t0 };
}
