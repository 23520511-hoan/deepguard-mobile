# HƯỚNG DẪN EDGE AI — Dev Client & Ráp Model ONNX

Tài liệu này hướng dẫn 3 lớp để đưa model AI chạy thật trên điện thoại.
Làm theo đúng thứ tự. Lớp 1 & 2 làm được NGAY (chưa cần model). Lớp 3 làm khi
model .onnx đã sẵn sàng.

---

## LỚP 1 — Tiền xử lý (ĐÃ CÓ SẴN, chỉ cần cài thư viện)

Copy 2 file này vào `app/_services/`:
- `preprocess.ts`  (resize 256x256 + chuẩn hóa [0,1])
- `onnxEngine.ts`  (nạp & chạy model, có fallback mock)

Rồi thay `app/_services/analyzer.ts` bằng bản mới trong gói này.

Cài thư viện cần cho tiền xử lý:

```bash
npx expo install expo-image-manipulator expo-asset
npm install upng-js
```

`upng-js` là bộ giải mã PNG thuần JS (đọc pixel từ ảnh). Không cần native.

Xong Lớp 1: app vẫn chạy như cũ (mock), nhưng đường ống tiền xử lý đã sẵn sàng.

---

## LỚP 2 — Dev Client (bắt buộc để chạy ONNX)

ONNX Runtime cần native module -> KHÔNG chạy trên Expo Go.
Phải build "dev client" (một app dev riêng của bạn). Làm 1 lần, sau đó dùng như
Expo Go bình thường (hot reload y hệt).

### 2.1. Cài công cụ
```bash
npm install -g eas-cli
npx expo install expo-dev-client
npm install onnxruntime-react-native
```

### 2.2. Đăng nhập EAS (miễn phí, cần tài khoản expo.dev)
```bash
eas login
```

### 2.3. Cấu hình build
```bash
eas build:configure
```

### 2.4. Build dev client cho Android
Cách A — build trên cloud (không cần cài Android SDK, ~10-15 phút):
```bash
eas build --profile development --platform android
```
Xong nó cho link tải file .apk -> cài vào điện thoại/emulator.

Cách B — build ngay tại máy (cần Android Studio đã cài đầy đủ):
```bash
npx expo run:android
```

### 2.5. Chạy
Sau khi cài app dev client:
```bash
npx expo start --dev-client
```
Quét QR bằng app dev client (KHÔNG phải Expo Go). Từ giờ hot reload như thường.

Xong Lớp 2: app chạy được với onnxruntime đã nhúng. Vẫn ở chế độ mock cho tới
khi bạn thả model vào (Lớp 3).

---

## LỚP 3 — Ráp Model Thật (khi có file .onnx)

### 3.1. Đặt file model
Copy file .onnx vào `assets/models/`, ví dụ:
```
assets/models/mvit_lka_fp16.onnx
assets/models/msfv_dfdc.onnx
```

### 3.2. Khai báo model trong `onnxEngine.ts`
Mở `app/_services/onnxEngine.ts`, sửa 2 chỗ:

(a) Bật cờ:
```typescript
export const USE_REAL_MODEL = true;
```

(b) Mở require file model:
```typescript
export const MODEL_ASSETS = {
  'mvit-lka-fp16': require('../../assets/models/mvit_lka_fp16.onnx'),
  'mvit-lka-fp32': require('../../assets/models/mvit_lka_fp32.onnx'),
  'msfv-dfdc':     require('../../assets/models/msfv_dfdc.onnx'),
  'msfv-ffpp':     require('../../assets/models/msfv_ffpp.onnx'),
};
```

### 3.3. Kiểm tra tên input/output
Mở file .onnx bằng Netron (https://netron.app) để xem tên tensor input/output.
Sửa trong `onnxEngine.ts`:
```typescript
export const IO_NAMES = {
  input: 'input',   // <- đổi cho khớp tên thật
  output: 'output', // <- đổi cho khớp tên thật
};
```

### 3.4. Cho Metro nhận file .onnx
Mở `metro.config.js`, thêm để Metro coi .onnx là asset:
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('onnx', 'ort');
module.exports = config;
```

### 3.5. Rebuild dev client (vì thêm asset lớn)
```bash
eas build --profile development --platform android
```
Cài lại, rồi `npx expo start --dev-client`.

Xong Lớp 3: app chạy model thật, 100% trên máy. Đúng Edge AI như đặc tả.

---

## VỀ VIDEO (làm sau cùng, tùy chọn)

Hiện tại đường thật xử lý media như 1 ảnh. Để xử lý VIDEO đúng chuẩn paper
(trích 10 frame theo thời gian), cần thêm bước trích frame:
```bash
npx expo install expo-video-thumbnails
```
Rồi trong `analyzer.ts`, khi mediaType === 'video': trích 10 mốc thời gian đều
nhau -> mỗi mốc lấy 1 thumbnail -> preprocessImage từng cái -> gộp thành
tensor [10,3,256,256] cho model chuỗi thời gian. (Tôi sẽ viết khi bạn cần.)

---

## GẶP LỖI?
- Lỗi native khó đọc -> chụp gửi Claude.
- Lỗi "tên input không khớp" -> mở Netron xem lại IO_NAMES.
- Model chạy ra kết quả kỳ lạ -> kiểm tra chuẩn hóa: model của bạn train với
  [0,1] hay [-1,1] hay chuẩn ImageNet? Phải khớp với preprocess.ts.
```
