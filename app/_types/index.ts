// Kiểu dữ liệu dùng chung toàn app

export type MediaType = 'image' | 'video';
export type ThemeMode = 'dark' | 'light';
export type Language = 'vi' | 'en';

// Cấu hình 1 model AI (danh sách để trong _config/models.ts)
export interface AIModelConfig {
  id: string;
  name: string; // tên hiển thị, vd "MViT-LKA v1.0 (FP16)"
  family: string; // nhóm kiến trúc, vd "MViT-LKA" | "MSFV"
  sizeLabel: string; // vd "2.50 MB"
  precision: string; // "FP16" | "FP32"
  descKey: string; // key i18n mô tả ngắn
}

// Media người dùng đang phân tích
export interface SelectedMedia {
  uri: string;
  type: MediaType;
}

// Một frame trong bằng chứng attention (màn Result)
export interface FrameEvidence {
  uri: string; // ảnh frame (giai đoạn mock: dùng lại media gốc)
  attention: number; // 0-1, trọng số attention
  anomaly: boolean; // true = frame đáng ngờ nhất
}

// Kết quả phân tích trả về từ _services/analyzer.ts
export interface AnalysisResult {
  score: number; // 0-100, độ tin cậy
  isFake: boolean; // true = deepfake
  fakeProbability: number; // 0-1
  faces: number;
  blurScore: number;
  frequency: string;
  confidence: string; // "Cao" | "Trung bình" | "Thấp"
  warning: string;
  latencyMs: number; // thời gian suy luận (giả lập)
  modelId: string;
  precision: string; // "FP16" | "FP32"
  frames: FrameEvidence[]; // bằng chứng attention (10 frame)
}

// Một mục trong lịch sử quét
export interface HistoryItem {
  id: string;
  date: string;
  mediaUri: string;
  mediaType: MediaType;
  score: number;
  isFake: boolean;
  modelId: string;
}
