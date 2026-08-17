# HƯỚNG DẪN LẮP MODEL TFLITE (msfv_lstm)

Model của bạn đã được đọc và cấu hình sẵn:
  input : [1, 12, 224, 224, 3] float32  (12 frame, 224x224, RGB, pixel [0,1])
  output: [1] float32  ->  LOGIT (code tự động sigmoid ra xác suất)

Toàn bộ code đã khớp đúng thông số này. Làm theo các bước:

---

## BƯỚC 1 — Chép file vào project

Từ gói này, chép vào `D:\DeepGuard\deepguard\`:
- `app/_services/preprocess.ts`      -> đè file cũ
- `app/_services/tfliteEngine.ts`    -> file mới
- `app/_services/analyzer.ts`        -> đè file cũ
- `app/_config/modelSpecs.ts`        -> file mới
- `app/_config/models.ts`            -> đè file cũ
- `assets/models/msfv_lstm.tflite`   -> file model (tạo thư mục assets/models nếu chưa có)

XÓA (nếu còn từ bản ONNX trước): `app/_services/onnxEngine.ts`

---

## BƯỚC 2 — Thêm dòng dịch (i18n)

Mở `app/_i18n/vi.ts`, thêm vào (gần khối 'model.'):
  'model.msfv_lstm_wild.desc': 'Huấn luyện Wild + cross DFDC/FF++/Celeb',

Mở `app/_i18n/en.ts`, thêm:
  'model.msfv_lstm_wild.desc': 'Trained on Wild, cross DFDC/FF++/Celeb',

---

## BƯỚC 3 — Cài thư viện

```powershell
cd D:\DeepGuard\deepguard
npm install react-native-fast-tflite --legacy-peer-deps
npx expo install expo-image-manipulator expo-asset
npm install upng-js --legacy-peer-deps
npm install babel-preset-expo @babel/core --save-dev --legacy-peer-deps
```

(Cài babel-preset-expo SAU CÙNG để không bị gỡ mất — như lần trước.)

---

## BƯỚC 4 — Cho Metro nhận file .tflite

Mở `metro.config.js`, sửa thành:
```javascript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite');
module.exports = config;
```

---

## BƯỚC 5 — react-native-fast-tflite CẦN dev client

Thư viện này là native -> KHÔNG chạy Expo Go. Phải build dev client.
(Xem bước dev client bên dưới.) Nếu chưa build dev client, app sẽ tự chạy
CHẾ ĐỘ MOCK (không lỗi), nhưng chưa ra kết quả thật.

### Build dev client tại máy (Android Studio):
```powershell
npx expo install expo-dev-client
npx expo prebuild --clean
npx expo run:android
```
Lần đầu prebuild + build hơi lâu (~10-20 phút). Sau đó:
```powershell
npx expo start --dev-client
```

---

## KIỂM TRA MODEL CHẠY ĐÚNG

Sau khi build dev client xong, mở app -> chọn 1 ảnh khuôn mặt -> Phân tích.
- Nếu ra điểm số khác nhau tùy ảnh -> model đã chạy thật.
- Nếu mọi ảnh đều ~cùng điểm -> kiểm tra lại (có thể còn ở chế độ mock,
  hoặc thư viện chưa nạp được model).

Trong `tfliteEngine.ts` có cờ `USE_REAL_MODEL = true` (đã bật sẵn).

---

## LƯU Ý QUAN TRỌNG VỀ KẾT QUẢ

1. Model NHẬN 12 FRAME. Với ẢNH TĨNH, code nhân bản 1 ảnh thành 12 frame
   giống nhau -> chạy được nhưng không phải kịch bản lý tưởng (model vốn
   cho video). Kết quả ảnh tĩnh mang tính minh họa.

2. Để xử lý VIDEO đúng (trích 12 frame theo thời gian), cần thêm:
   ```powershell
   npx expo install expo-video-thumbnails
   ```
   rồi báo Claude để cập nhật preprocess (trích 12 mốc thời gian).

3. Chuẩn hóa đang để [0,1] (chia 255). Nếu bạn train model với chuẩn hóa
   KHÁC (vd [-1,1] hoặc ImageNet mean/std), báo Claude để sửa 'normalize'
   trong modelSpecs.ts — nếu sai, kết quả sẽ lệch.

---

## THÊM MODEL MỚI (khi bạn train tiếp)

1. Chép file .tflite mới vào assets/models/
2. Mở `app/_config/modelSpecs.ts`, thêm 1 dòng vào MODEL_SPECS với id mới +
   require file + shape đúng.
3. Mở `app/_config/models.ts`, thêm 1 dòng vào AI_MODELS với CÙNG id đó.
4. Thêm dòng dịch model.<id>.desc vào vi.ts/en.ts.
Xong — Settings tự hiện model mới để chọn.
