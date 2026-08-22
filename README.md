# DeepGuard — Edge AI Deepfake Detector

Ứng dụng di động (React Native + Expo) phát hiện **Deepfake** chạy **trực tiếp trên thiết bị** (Edge AI, không gửi ảnh lên server). Đề tài nghiên cứu khoa học.

## Tính năng

- Phát hiện deepfake từ **ảnh** bằng model **MSFV-LSTM** (TensorFlow Lite) chạy on-device.
- **Phát hiện khuôn mặt** (ML Kit): chặn ảnh không có mặt hoặc có nhiều mặt.
- Kết quả trung thực: % Deepfake / % Thật, có mức "Không chắc chắn".
- Đa model (chọn trong Settings), song ngữ Việt/Anh, giao diện Dark/Light.
- Lịch sử quét lưu bền, chính sách bảo mật, chia sẻ báo cáo.

## Công nghệ

- Expo SDK 56, React Native 0.85, expo-router, TypeScript, Zustand.
- `react-native-fast-tflite` — chạy model .tflite on-device.
- `@react-native-ml-kit/face-detection` — đếm khuôn mặt trong ảnh.

## Yêu cầu

- Node.js >= 18
- Android Studio (SDK + emulator), hoặc điện thoại Android thật
- JDK (dùng bản đi kèm Android Studio: `.../Android Studio/jbr`)

## Cách chạy (development)

> App dùng thư viện native (TFLite, ML Kit) nên **KHÔNG chạy được trên Expo Go**.
> Phải build **dev client** một lần.

```bash
# 1. Cài phụ thuộc
npm install

# 2. Đặt JAVA_HOME (Windows PowerShell) - trỏ vào JDK của Android Studio
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# 3. Prebuild (tạo thư mục android/)
npx expo prebuild --clean

# 4. QUAN TRỌNG: sửa Gradle về 8.13
#    Mở android/gradle/wrapper/gradle-wrapper.properties
#    distributionUrl=...gradle-8.13-all.zip

# 5. Copy model vào assets native (nếu prebuild làm mất)
#    Windows: copy assets\models\msfv_lstm.tflite android\app\src\main\assets\

# 6. Build + cài lên emulator/điện thoại (emulator phải đang mở)
npx expo run:android
```

Các lần sau (không thêm thư viện native): chỉ cần `npx expo start --dev-client`.

## Cấu hình quan trọng

**metro.config.js** phải cho phép nạp file .tflite:
```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite');
module.exports = config;
```

## Cấu trúc

```
app/
  _layout.tsx              điều hướng (expo-router)
  _store/appStore.ts       state toàn cục (Zustand) + lưu bền
  _theme/                  màu Dark/Light + useTheme
  _i18n/                   song ngữ Việt/Anh + useT
  _config/models.ts        danh sách model hiển thị (Settings)
  _config/modelSpecs.ts    thông số model (shape, chuẩn hóa, ngưỡng)
  _services/
    analyzer.ts            điều phối: mặt -> tiền xử lý -> TFLite -> kết quả
    faceDetector.ts        đếm khuôn mặt (ML Kit)
    preprocess.ts          resize 224x224, chuẩn hóa, dựng tensor 12 frame
    tfliteEngine.ts        nạp & chạy model .tflite
  _types/index.ts          kiểu dữ liệu dùng chung
  *.tsx                    các màn hình
assets/
  logo.png
  models/msfv_lstm.tflite  model TFLite
```

## Model hiện tại

- **MSFV-LSTM (Wild)** — input `[1, 12, 224, 224, 3]` float32, output logit (sigmoid ra xác suất fake). Train trên Wild + cross DFDC/FF++/Celeb.

## Thêm / đổi model

1. Chép file `.tflite` mới vào `assets/models/`.
2. Thêm thông số vào `app/_config/modelSpecs.ts` (numFrames, inputSize, normalize, outputType, threshold).
3. Thêm require + id vào `app/_services/tfliteEngine.ts` (map MODEL_REQUIRES).
4. Thêm vào danh sách `app/_config/models.ts` để hiện trong Settings.
5. Build lại: `npx expo run:android`.

## Ghi chú

- Kết quả mang tính tham khảo kỹ thuật dựa trên xác suất của mô hình AI, không thay thế giám định pháp lý.
- Tốc độ suy luận trên **emulator** chậm (do CPU giả lập); trên **điện thoại thật** nhanh hơn nhiều.

