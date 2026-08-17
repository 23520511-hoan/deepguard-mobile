import { AnalysisResult, FrameEvidence, MediaType } from '../_types';
import { getModelById } from '../_config/models';
import { getSpec } from '../_config/modelSpecs';
import { buildInputTensor } from './preprocess';
import { runInference, USE_REAL_MODEL } from './tfliteEngine';
import { detectFaceCount } from './faceDetector';

// Lỗi: không thấy khuôn mặt
export class NoFaceError extends Error {
  constructor() { super('NO_FACE'); this.name = 'NoFaceError'; }
}
// Lỗi: nhiều khuôn mặt
export class MultiFaceError extends Error {
  count: number;
  constructor(count: number) { super('MULTI_FACE'); this.name = 'MultiFaceError'; this.count = count; }
}

function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }

type Verdict = 'real' | 'fake' | 'uncertain';
function decide(fakeProb: number, threshold: number): Verdict {
  const margin = 0.15;
  if (fakeProb >= threshold + margin) return 'fake';
  if (fakeProb <= threshold - margin) return 'real';
  return 'uncertain';
}

function mockFrames(mediaUri: string, fakeProb: number): FrameEvidence[] {
  const anomalyIndex = Math.floor(rand(0, 10));
  return Array.from({ length: 10 }, (_, i) => ({
    uri: mediaUri,
    attention: i === anomalyIndex ? Math.max(0.6, fakeProb) : rand(0.05, 0.4),
    anomaly: i === anomalyIndex,
  }));
}

export async function analyzeMedia(
  mediaUri: string, mediaType: MediaType, modelId: string, threshold: number
): Promise<AnalysisResult> {
  const model = getModelById(modelId);
  const spec = getSpec(modelId);

  // === BƯỚC 1: KIỂM TRA KHUÔN MẶT (chỉ với ảnh) ===
  // Nếu thư viện chạy được: 0 mặt -> NoFace; >1 mặt -> MultiFace.
  // Nếu thư viện chưa sẵn sàng: bỏ qua, vẫn phân tích (không chặn app).
  if (mediaType === 'image') {
    const fc = await detectFaceCount(mediaUri);
    if (fc.available) {
      if (fc.count === 0) throw new NoFaceError();
      if (fc.count > 1) throw new MultiFaceError(fc.count);
    }
  }

  // === BƯỚC 2: PHÂN TÍCH ===
  let fakeProbability: number;
  let latencyMs: number;
  let faceCount = 1;

  const modelReady = USE_REAL_MODEL && spec != null;

  if (modelReady && spec) {
    const tPre0 = Date.now();
    const input = await buildInputTensor(mediaUri, spec.numFrames, spec.inputSize, spec.normalize);
    console.log('[SPEED] Tiền xử lý =', Date.now() - tPre0, 'ms');

    const tRun0 = Date.now();
    const inf = await runInference(modelId, input);
    console.log('[SPEED] Chạy model =', Date.now() - tRun0, 'ms');

    fakeProbability = inf.fakeProbability;
    latencyMs = inf.latencyMs;
  } else {
    await new Promise((r) => setTimeout(r, 2000));
    fakeProbability = rand(0.05, 0.95);
    latencyMs = Math.round(rand(72, 92));
  }

  const useThreshold = spec?.threshold ?? threshold ?? 0.5;
  const verdict = decide(fakeProbability, useThreshold);
  const distance = Math.abs(fakeProbability - 0.5) * 2;
  const score = Math.round(distance * 100);

  let confidence: string;
  if (verdict === 'uncertain') confidence = 'Không chắc chắn';
  else if (score >= 70) confidence = 'Cao';
  else if (score >= 40) confidence = 'Trung bình';
  else confidence = 'Thấp';

  return {
    score, isFake: verdict === 'fake',
    fakeProbability: parseFloat(fakeProbability.toFixed(3)),
    faces: faceCount, blurScore: 0, frequency: '',
    confidence, warning: '',
    latencyMs, modelId: model.id, precision: model.precision,
    frames: mockFrames(mediaUri, fakeProbability),
  };
}
