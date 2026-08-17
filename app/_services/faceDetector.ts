declare const require: (name: string) => any;

// ============================================================================
//  FACE DETECTOR — đếm số khuôn mặt trong 1 ẢNH TĨNH.
//  Dùng @react-native-ml-kit/face-detection (KHÔNG cần camera/worklets).
//  API: FaceDetection.detect(uri, options) -> Promise<Face[]>
//
//  AN TOÀN: nếu thư viện chưa cài -> { available:false }, luồng bỏ qua bước này.
// ============================================================================

export interface FaceCountResult {
  available: boolean;
  count: number;
}

export async function detectFaceCount(uri: string): Promise<FaceCountResult> {
  let FaceDetection: any;
  try {
    const mod = require('@react-native-ml-kit/face-detection');
    FaceDetection = mod.default || mod;
  } catch (e) {
    console.log('[FaceDetect] lib chưa sẵn sàng:', String(e));
    return { available: false, count: -1 };
  }

  try {
    // detect trả về mảng Face. performanceMode 'fast' cho nhanh.
    const faces = await FaceDetection.detect(uri, {
      performanceMode: 'fast',
      landmarkMode: 'none',
      contourMode: 'none',
      classificationMode: 'none',
      minFaceSize: 0.1,
    });
    const count = Array.isArray(faces) ? faces.length : 0;
    console.log('[FaceDetect] số mặt =', count);
    return { available: true, count };
  } catch (e) {
    console.log('[FaceDetect] lỗi khi phát hiện:', String(e));
    // Lỗi khi phát hiện -> coi như không kiểm tra được, cho phân tích tiếp
    return { available: false, count: -1 };
  }
}
