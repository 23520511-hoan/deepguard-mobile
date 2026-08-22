import { getSpec } from '../_config/modelSpecs';

declare const require: (name: string) => any;

// ============================================================================
//  TFLITE ENGINE — nạp model AN TOÀN cho cả DEV lẫn RELEASE (APK).
//
//  Vấn đề: trong APK release, truyền require(...tflite) vào loadTensorflowModel
//  khiến thư viện tạo URL từ tên asset -> "MalformedURLException no protocol".
//
//  Giải pháp: dùng expo-asset để lấy/tải model thành FILE THẬT trên máy,
//  rồi nạp bằng { url: 'file://...' }. Cách này không phụ thuộc noCompress,
//  chạy giống nhau ở dev và release.
// ============================================================================

export const USE_REAL_MODEL = true;

// require TĨNH từng model (Metro cần thấy require trực tiếp để đóng gói).
const MODEL_REQUIRES: Record<string, any> = {
  'tlcnn': require('../../assets/models/model_tlcnn_optimized.tflite'),
  'unified-robust': require('../../assets/models/model_unified_robust.tflite'),
  '3d-mobilenet': require('../../assets/models/model_3d_mobilenet_optimized.tflite'),
  'msfv-lstm-wild': require('../../assets/models/msfv_lstm_float32.tflite'),
};

// Tên file đích khi copy ra cache (để nạp bằng file://)
const MODEL_FILENAMES: Record<string, string> = {
  'tlcnn': 'model_tlcnn_optimized.tflite',
  'unified-robust': 'model_unified_robust.tflite',
  '3d-mobilenet': 'model_3d_mobilenet_optimized.tflite',
  'msfv-lstm-wild': 'msfv_lstm_float32.tflite',
};

export interface RawInference { fakeProbability: number; latencyMs: number; }
function sigmoid(x: number): number { return 1 / (1 + Math.exp(-x)); }
const modelCache: Record<string, any> = {};
const fileUriCache: Record<string, string> = {};

// Lấy đường dẫn FILE THẬT (file://) của model. Copy ra cache nếu cần.
async function resolveModelFileUri(modelId: string): Promise<string> {
  if (fileUriCache[modelId]) return fileUriCache[modelId];

  const { Asset } = require('expo-asset');
  const moduleRef = MODEL_REQUIRES[modelId];

  // Tải asset về máy (trong APK: asset đã đóng gói sẵn -> có localUri file://)
  const asset = Asset.fromModule(moduleRef);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  let uri = asset.localUri || asset.uri;

  // Nếu localUri đã là file:// -> dùng luôn (thường gặp ở release).
  if (uri && uri.startsWith('file://')) {
    fileUriCache[modelId] = uri;
    console.log('[TFLite] dùng localUri:', modelId);
    return uri;
  }

  // Nếu không phải file:// (vd http ở dev) -> tải nội dung về file thật.
  const FileSystem = require('expo-file-system');
  const dest = FileSystem.cacheDirectory + MODEL_FILENAMES[modelId];
  try {
    const info = await FileSystem.getInfoAsync(dest);
    if (!info.exists) {
      console.log('[TFLite] tải model về cache:', modelId);
      const res = await FileSystem.downloadAsync(uri, dest);
      uri = res.uri;
    } else {
      uri = dest;
    }
  } catch (e) {
    // getInfoAsync có thể deprecated ở 1 số bản; thử tải thẳng
    try {
      const res = await FileSystem.downloadAsync(uri, dest);
      uri = res.uri;
    } catch (e2) {
      console.log('[TFLite] không tải được file, dùng uri gốc:', String(e2));
    }
  }

  fileUriCache[modelId] = uri;
  return uri;
}

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
    const fileUri = await resolveModelFileUri(modelId);
    console.log('[TFLite] nạp model:', modelId, '| uri kiểu:', fileUri.slice(0, 7));
    try {
      // Nạp bằng object { url: file://... } — KHÔNG dùng require trực tiếp.
      model = await tflite.loadTensorflowModel({ url: fileUri }, []);
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
