import { getSpec } from '../_config/modelSpecs';

declare const require: (name: string) => any;

// ============================================================================
//  TFLITE ENGINE — cú pháp ĐÚNG theo tài liệu chính thức:
//    loadTensorflowModel(require('...tflite'), [])   <-- có [] delegate rỗng
//  Thiếu [] -> native nhận undefined -> "Value is undefined, expected Object".
//  YÊU CẦU: metro.config.js có assetExts.push('tflite').
// ============================================================================

export const USE_REAL_MODEL = true;

const MODEL_MODULE = require('../../assets/models/msfv_lstm.tflite');

export interface RawInference { fakeProbability: number; latencyMs: number; }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }
const modelCache: Record<string, any> = {};

export async function runInference(modelId: string, input: Float32Array): Promise<RawInference> {
  const spec = getSpec(modelId);
  if (!USE_REAL_MODEL || !spec) {
    await new Promise((r) => setTimeout(r, 300));
    return { fakeProbability: Math.random(), latencyMs: 80 };
  }

  const tflite = require('react-native-fast-tflite');
  const t0 = Date.now();

  let model = modelCache[modelId];
  if (!model) {
    try {
      console.log('[TFLite] >>> nạp require(module) + [] ...');
      // CÚ PHÁP ĐÚNG: tham số thứ 2 = [] (mảng delegate rỗng). BẮT BUỘC.
      model = await tflite.loadTensorflowModel(MODEL_MODULE, []);
      console.log('[TFLite] >>> NẠP OK');
    } catch (e1: any) {
      console.log('[TFLite] cách 1 lỗi:', e1?.message || String(e1));
      // Dự phòng: dùng useTensorflowModel-style qua loadTensorflowModel không delegate
      try {
        console.log('[TFLite] >>> thử require(module) không tham số 2...');
        model = await tflite.loadTensorflowModel(MODEL_MODULE);
        console.log('[TFLite] >>> NẠP OK (không delegate)');
      } catch (e2: any) {
        console.log('[TFLite] cách 2 lỗi:', e2?.message || String(e2));
        throw e2;
      }
    }
    modelCache[modelId] = model;
  }

  const inputBuffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  let outputs: any;
  try {
    if (typeof model.runSync === 'function') outputs = model.runSync([inputBuffer]);
    else outputs = await model.run([inputBuffer]);
  } catch (e: any) {
    console.log('[TFLite] !!! LỖI RUN:', e?.message || String(e));
    throw e;
  }
  const out0 = new Float32Array(outputs[0]);
  const raw = out0[0];
  const prob = spec.outputType === 'logit' ? sigmoid(raw) : raw;
  console.log('[TFLite] prob =', prob.toFixed(4), '|', Date.now() - t0, 'ms');
  return { fakeProbability: prob, latencyMs: Date.now() - t0 };
}
