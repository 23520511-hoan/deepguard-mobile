import * as ImageManipulator from 'expo-image-manipulator';

declare const require: (name: string) => any;

// ============================================================================
//  TIỀN XỬ LÝ — dựng tensor cho model.
//  numFrames=1 -> [1,224,224,3] (ảnh đơn)
//  numFrames>1 -> [1,T,224,224,3] (lặp ảnh thành T frame)
// ============================================================================

async function decodeOneFrame(
  uri: string, inputSize: number, normalize: 'zero_one' | 'minus_one_one'
): Promise<Float32Array> {
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
    let r = rgba[i * 4] / 255, g = rgba[i * 4 + 1] / 255, b = rgba[i * 4 + 2] / 255;
    if (normalize === 'minus_one_one') { r = r*2-1; g = g*2-1; b = b*2-1; }
    rgb[i*3] = r; rgb[i*3+1] = g; rgb[i*3+2] = b;
  }
  return rgb;
}

export async function buildInputTensor(
  uri: string, numFrames: number, inputSize: number,
  normalize: 'zero_one' | 'minus_one_one'
): Promise<Float32Array> {
  const oneFrame = await decodeOneFrame(uri, inputSize, normalize);
  if (numFrames <= 1) return oneFrame; // ảnh đơn: [1,224,224,3]
  // chuỗi: lặp ảnh thành numFrames frame
  const frameLen = oneFrame.length;
  const data = new Float32Array(numFrames * frameLen);
  for (let f = 0; f < numFrames; f++) data.set(oneFrame, f * frameLen);
  return data;
}

function atobFallback(base64: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '', buffer = 0, bits = 0;
  for (let i = 0; i < base64.length; i++) {
    const c = base64[i]; if (c === '=') break;
    const idx = chars.indexOf(c); if (idx === -1) continue;
    buffer = (buffer << 6) | idx; bits += 6;
    if (bits >= 8) { bits -= 8; output += String.fromCharCode((buffer >> bits) & 0xff); }
  }
  return output;
}
