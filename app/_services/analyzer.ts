import { AnalysisResult, FrameEvidence, MediaType } from '../_types';
import { getModelById } from '../_config/models';
import { getSpec } from '../_config/modelSpecs';
import { buildInputTensor } from './preprocess';
import { runInference, USE_REAL_MODEL } from './tfliteEngine';
import { detectFaceCount } from './faceDetector';
import { extractFrames } from './videoFrames';

// ============================================================================
//  ANALYZER — xử lý CẢ ẢNH LẪN VIDEO.
//  - Ảnh: face detect -> model -> kết quả (như cũ).
//  - Video: trích 10 khung -> mỗi khung: face detect + model
//           -> tổng hợp timeline + kết luận (>50% khung fake = video giả).
// ============================================================================

export class NoFaceError extends Error {
  constructor() { super('NO_FACE'); this.name = 'NoFaceError'; }
}
export class MultiFaceError extends Error {
  count: number;
  constructor(count: number) { super('MULTI_FACE'); this.name = 'MultiFaceError'; this.count = count; }
}
export class VideoNoFaceError extends Error {
  constructor() { super('VIDEO_NO_FACE'); this.name = 'VideoNoFaceError'; }
}

function rand(min: number, max: number): number { return Math.random() * (max - min) + min; }

type Verdict = 'real' | 'fake' | 'uncertain';
function decide(fakeProb: number, threshold: number): Verdict {
  const margin = 0.15;
  if (fakeProb >= threshold + margin) return 'fake';
  if (fakeProb <= threshold - margin) return 'real';
  return 'uncertain';
}

function confidenceLabel(verdict: Verdict, score: number): string {
  if (verdict === 'uncertain') return 'Không chắc chắn';
  if (score >= 70) return 'Cao';
  if (score >= 40) return 'Trung bình';
  return 'Thấp';
}

// ---- Chạy model trên 1 ảnh, trả xác suất fake ----
async function inferOneImage(uri: string, modelId: string): Promise<{ prob: number; ms: number }> {
  const spec = getSpec(modelId);
  if (!USE_REAL_MODEL || !spec) {
    await new Promise((r) => setTimeout(r, 200));
    return { prob: rand(0.05, 0.95), ms: 80 };
  }
  const input = await buildInputTensor(uri, spec.numFrames, spec.inputSize, spec.normalize);
  const inf = await runInference(modelId, input);
  return { prob: inf.fakeProbability, ms: inf.latencyMs };
}

// ============================================================================
//  PHÂN TÍCH ẢNH (giữ nguyên logic cũ)
// ============================================================================
async function analyzeImage(
  mediaUri: string, modelId: string, threshold: number
): Promise<AnalysisResult> {
  const model = getModelById(modelId);

  const fc = await detectFaceCount(mediaUri);
  if (fc.available) {
    if (fc.count === 0) throw new NoFaceError();
    if (fc.count > 1) throw new MultiFaceError(fc.count);
  }

  const { prob: fakeProbability, ms: latencyMs } = await inferOneImage(mediaUri, modelId);
  const spec = getSpec(modelId);
  const useThreshold = spec?.threshold ?? threshold ?? 0.5;
  const verdict = decide(fakeProbability, useThreshold);
  const distance = Math.abs(fakeProbability - 0.5) * 2;
  const score = Math.round(distance * 100);

  return {
    score, isFake: verdict === 'fake',
    fakeProbability: parseFloat(fakeProbability.toFixed(3)),
    faces: 1, blurScore: 0, frequency: '',
    confidence: confidenceLabel(verdict, score), warning: '',
    latencyMs, modelId: model.id, precision: model.precision,
    frames: [], // ảnh không có timeline
  };
}

// ============================================================================
//  PHÂN TÍCH VIDEO — trích khung, chạy model từng khung, tổng hợp
// ============================================================================
async function analyzeVideo(
  mediaUri: string, modelId: string, threshold: number,
  onProgress?: (done: number, total: number) => void
): Promise<AnalysisResult> {
  const model = getModelById(modelId);
  const spec = getSpec(modelId);
  const useThreshold = spec?.threshold ?? threshold ?? 0.5;

  // 1) Trích 10 khung
  const FRAME_COUNT = 10;
  const vframes = await extractFrames(mediaUri, FRAME_COUNT);

  // 2) Với mỗi khung: face detect + model
  const frameResults: FrameEvidence[] = [];
  const probs: number[] = [];
  let framesWithFace = 0;
  let totalMs = 0;

  for (let i = 0; i < vframes.length; i++) {
    const f = vframes[i];
    onProgress?.(i, vframes.length);

    // face detect trên khung
    let hasFace = true;
    const fc = await detectFaceCount(f.uri);
    if (fc.available) hasFace = fc.count >= 1;

    if (!hasFace) {
      // khung không có mặt -> đánh dấu, không tính vào kết luận
      frameResults.push({ uri: f.uri, attention: 0, anomaly: false });
      continue;
    }
    framesWithFace++;

    const { prob, ms } = await inferOneImage(f.uri, modelId);
    totalMs += ms;
    probs.push(prob);

    const isFrameFake = prob >= useThreshold;
    frameResults.push({
      uri: f.uri,
      attention: prob,          // dùng attention = xác suất fake của khung
      anomaly: isFrameFake,     // anomaly = khung bị coi là giả
    });
  }

  onProgress?.(vframes.length, vframes.length);

  // 3) Không khung nào có mặt -> lỗi
  if (framesWithFace === 0) throw new VideoNoFaceError();

  // 4) Tổng hợp: % khung fake, xác suất trung bình
  const fakeFrames = probs.filter((p) => p >= useThreshold).length;
  const fakeRatio = fakeFrames / probs.length;      // 0..1
  const avgProb = probs.reduce((a, b) => a + b, 0) / probs.length;

  // Kết luận cả video: fake nếu >50% khung fake
  const isFake = fakeRatio > 0.5;
  // score = độ tin cậy theo tỉ lệ (càng lệch 50% càng chắc)
  const score = Math.round(Math.abs(fakeRatio - 0.5) * 2 * 100);
  const verdict: Verdict = fakeRatio > 0.5 ? 'fake' : (fakeRatio < 0.35 ? 'real' : 'uncertain');

  return {
    score,
    isFake,
    fakeProbability: parseFloat(avgProb.toFixed(3)),
    faces: framesWithFace,          // số khung có mặt
    blurScore: parseFloat(fakeRatio.toFixed(2)), // tái dụng field: tỉ lệ khung fake
    frequency: `${fakeFrames}/${probs.length} khung nghi giả`,
    confidence: confidenceLabel(verdict, score),
    warning: '',
    latencyMs: totalMs,
    modelId: model.id,
    precision: model.precision,
    frames: frameResults,           // TIMELINE các khung
  };
}

// ============================================================================
//  ĐIỂM VÀO CHUNG — giữ nguyên chữ ký cũ, thêm onProgress tùy chọn
// ============================================================================
export async function analyzeMedia(
  mediaUri: string,
  mediaType: MediaType,
  modelId: string,
  threshold: number,
  onProgress?: (done: number, total: number) => void
): Promise<AnalysisResult> {
  if (mediaType === 'video') {
    return analyzeVideo(mediaUri, modelId, threshold, onProgress);
  }
  return analyzeImage(mediaUri, modelId, threshold);
}
