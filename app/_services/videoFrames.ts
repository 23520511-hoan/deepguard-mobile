import * as VideoThumbnails from 'expo-video-thumbnails';

// ============================================================================
//  TRÍCH FRAME TỪ VIDEO
//  Dùng expo-video-thumbnails: lấy N khung ở các mốc thời gian đều nhau.
//  Trả về mảng { uri, timeMs } để đưa vào face detect + model.
//
//  LƯU Ý bug Android: getThumbnailAsync đôi khi trả keyframe gần nhất
//  (các mốc gần nhau ra cùng khung). Ta lấy mốc CÁCH XA nhau để giảm trùng.
// ============================================================================

export interface VideoFrame {
  uri: string;
  timeMs: number;
  index: number;
}

// Ước lượng thời lượng video (ms). expo-video-thumbnails không cho duration,
// nên ta thử lấy thumbnail ở các mốc tăng dần tới khi lỗi -> ước lượng.
// Đơn giản & ổn định hơn: giả định video >= 3s, trải đều trong khoảng ước lượng.
async function probeDurationMs(uri: string): Promise<number> {
  // Thử lấy khung ở các mốc xa dần; mốc cao nhất thành công ~ duration.
  const probes = [30000, 20000, 12000, 8000, 5000, 3000, 1500];
  for (const t of probes) {
    try {
      await VideoThumbnails.getThumbnailAsync(uri, { time: t, quality: 0.1 });
      return t + 1000; // thành công -> video dài ít nhất tới đây
    } catch {
      // mốc này vượt quá độ dài -> thử mốc ngắn hơn
    }
  }
  return 3000; // fallback: coi như video ngắn 3s
}

/**
 * Trích `count` khung trải đều theo thời gian.
 * @param uri   đường dẫn video
 * @param count số khung cần lấy (mặc định 10)
 */
export async function extractFrames(
  uri: string,
  count: number = 10
): Promise<VideoFrame[]> {
  const durationMs = await probeDurationMs(uri);

  // Bỏ 5% đầu và 5% cuối (hay bị đen/mờ), chia đều phần giữa.
  const startMs = Math.floor(durationMs * 0.05);
  const endMs = Math.floor(durationMs * 0.95);
  const span = Math.max(endMs - startMs, 1);
  const step = span / Math.max(count - 1, 1);

  const frames: VideoFrame[] = [];
  for (let i = 0; i < count; i++) {
    const timeMs = Math.floor(startMs + step * i);
    try {
      const { uri: frameUri } = await VideoThumbnails.getThumbnailAsync(uri, {
        time: timeMs,
        quality: 0.7,
      });
      frames.push({ uri: frameUri, timeMs, index: i });
    } catch (e) {
      console.log('[VideoFrames] lỗi lấy khung tại', timeMs, 'ms:', String(e));
      // bỏ qua khung lỗi, tiếp tục
    }
  }

  if (frames.length === 0) {
    throw new Error('VIDEO_NO_FRAMES');
  }
  console.log('[VideoFrames] trích được', frames.length, 'khung / yêu cầu', count);
  return frames;
}
