import * as ImageManipulator from 'expo-image-manipulator';

declare const require: (name: string) => any;

// ============================================================================
//  TIỀN XỬ LÝ (tối ưu tốc độ)
//  Model cần [1, 12, 224, 224, 3] float32, NHWC, pixel [0,1].
//  Tối ưu: resize ảnh về ĐÚNG 224x224 NGAY (giảm pixel phải giải mã),
//  giải mã 1 lần, rồi tái sử dụng cho cả 12 frame -> nhanh hơn nhiều.
// ============================================================================

// Giải mã 1 ảnh 224x224 -> Float32Array RGB [224*224*3], giá trị [0,1]
async function decodeOneFrame(
  uri: string,
  inputSize: number,
  normalize: 'zero_one' | 'minus_one_one'
): Promise<Float32Array> {
  // Resize NGAY về kích thước model cần -> giảm mạnh số pixel phải giải mã.
  // compress 1 + PNG để không mất pixel do nén.
  const out = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: inputSize, height: inputSize } }],
    { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true }
  );
  if (!out.base64) throw new Error('preprocess: không lấy được pixel');

  const binary = globalThis.atob ? globalThis.atob(out.base64) : atobFallback(out.base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  const UPNG = require('upng-js');
  const img = UPNG.decode(bytes.buffer);
  const rgba = new Uint8Array(UPNG.toRGBA8(img)[0]);

  const px = inputSize * inputSize;
  const rgb = new Float32Array(px * 3);
  for (let i = 0; i < px; i++) {
    let r = rgba[i * 4] / 255;
    let g = rgba[i * 4 + 1] / 255;
    let b = rgba[i * 4 + 2] / 255;
    if (normalize === 'minus_one_one') {
      r = r * 2 - 1; g = g * 2 - 1; b = b * 2 - 1;
    }
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
  }
  return rgb;
}

/**
 * Tạo tensor [1, numFrames, size, size, 3].
 * Ảnh tĩnh: giải mã 1 LẦN rồi copy cho 12 frame (nhanh).
 */
export async function buildInputTensor(
  uri: string,
  numFrames: number,
  inputSize: number,
  normalize: 'zero_one' | 'minus_one_one'
): Promise<Float32Array> {
  const oneFrame = await decodeOneFrame(uri, inputSize, normalize);
  const frameLen = oneFrame.length;
  const data = new Float32Array(numFrames * frameLen);
  for (let f = 0; f < numFrames; f++) {
    data.set(oneFrame, f * frameLen);
  }
  return data;
}

function atobFallback(base64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < base64.length; i++) {
    const c = base64[i];
    if (c === '=') break;
    const idx = chars.indexOf(c);
    if (idx === -1) continue;
    buffer = (buffer << 6) | idx;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }
  return output;
}
