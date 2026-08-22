# DeepGuard — Edge AI Deepfake Detector

Ứng dụng di động (React Native + Expo) phát hiện **Deepfake** chạy **trực tiếp trên thiết bị** (Edge AI — không gửi ảnh/video lên máy chủ). Đề tài nghiên cứu khoa học.

## 📥 Tải APK / Xem demo

- **File APK (cài trực tiếp lên Android):** https://drive.google.com/file/d/1r4hKPUYan1XXyCmxMrDqkOPd7V5HQhLr/view?usp=drive_link

> Tải file `.apk` về điện thoại Android → mở file → cho phép "cài từ nguồn không xác định" → cài và mở app.


## Tính năng

- Phát hiện deepfake từ **ảnh** và **video**, chạy on-device bằng TensorFlow Lite.
- **Phân tích video theo khung**: trích 10 khung, phát hiện mặt + chạy model từng khung, tổng hợp thành timeline và kết luận chung (video nghi giả nếu >50% khung nghi giả).
- **Phát hiện khuôn mặt** (ML Kit): chặn ảnh không có mặt hoặc có nhiều mặt.
- **4 mô hình AI** chọn được trong Cài đặt, mỗi mô hình có đặc điểm riêng.
- Kết quả trung thực: % thật / % giả, có mức "Không chắc chắn"; timeline khung cho video.
- Song ngữ Việt/Anh, giao diện Dark/Light, lịch sử quét, chính sách bảo mật, chia sẻ báo cáo.

## Công nghệ

- Expo SDK 56, React Native 0.85, expo-router, TypeScript, Zustand.
- `react-native-fast-tflite` — chạy model .tflite on-device.
- `@react-native-ml-kit/face-detection` — đếm khuôn mặt trong ảnh.
- `expo-video-thumbnails` — trích khung từ video.

## Các mô hình

Đặt trong `assets/models/`. Chọn mô hình trong màn Cài đặt.

| Mô hình | Đầu vào | Kích thước | Đặc điểm |
|---------|---------|-----------|----------|
| TL-CNN (mặc định) | 1 ảnh | 4.6 MB | Nhanh — hợp cho ảnh và video |
| Unified Robust | 1 ảnh | 8.9 MB | Ổn định, chống nhiễu |
| 3D-MobileNet | 10 khung | 1.8 MB | Nhẹ nhất |
| MSFV-LSTM (Wild) | 12 khung | 2.5 MB | Huấn luyện Wild, độ chính xác cao hơn (chậm hơn) |

> Video nên dùng mô hình 1 ảnh (TL-CNN / Unified) để nhanh. Mô hình chuỗi khung
> (MSFV-LSTM, 3D-MobileNet) chính xác hơn nhưng mỗi khung mất vài giây.

## Yêu cầu môi trường

- Node.js >= 18
- Android Studio (SDK + emulator) hoặc điện thoại Android thật
- JDK: dùng bản đi kèm Android Studio (`.../Android Studio/jbr`)

## Cách chạy (development)

> App dùng thư viện native (TFLite, ML Kit, video-thumbnails) nên **KHÔNG chạy
> trên Expo Go**. Phải build dev client hoặc APK.

```bash
# 1. Cài phụ thuộc
npm install --legacy-peer-deps

# 2. Đặt JAVA_HOME (Windows PowerShell)
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# 3. Prebuild (tạo thư mục android/)
npx expo prebuild --clean

# 4. Sửa Gradle về 8.13:
#    android/gradle/wrapper/gradle-wrapper.properties
#    distributionUrl=...gradle-8.13-all.zip

# 5. Chạy trên emulator/thiết bị
npx expo run:android
```

## Cấu hình quan trọng

**metro.config.js** — cho phép nạp file .tflite:
```js
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite');
module.exports = config;
```

**android/app/build.gradle** — không nén file .tflite (trong khối `androidResources`):
```gradle
androidResources {
    ignoreAssetsPattern '...'
    noCompress 'tflite'
}
```

## Build APK (bản cài được)

```bash
cd android
.\gradlew assembleRelease
```
APK: `android/app/build/outputs/apk/release/app-release.apk`

Cài lên điện thoại qua ADB:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Cấu trúc dự án

```
app/
  _layout.tsx              điều hướng (expo-router)
  _store/appStore.ts       state toàn cục (Zustand) + lưu bền
  _theme/                  màu Dark/Light + useTheme
  _i18n/                   song ngữ Việt/Anh + useT
  _config/models.ts        danh sách mô hình hiển thị (Settings)
  _config/modelSpecs.ts    thông số mô hình (shape, chuẩn hóa, ngưỡng)
  _services/
    analyzer.ts            điều phối ảnh + video
    faceDetector.ts        đếm khuôn mặt (ML Kit)
    videoFrames.ts         trích khung từ video
    preprocess.ts          resize 224x224, chuẩn hóa, dựng tensor
    tfliteEngine.ts        nạp & chạy model .tflite
  _types/index.ts          kiểu dữ liệu dùng chung
  *.tsx                    các màn hình
assets/
  logo.png
  models/*.tflite          các mô hình TFLite
```

## Luồng hoạt động

Onboarding → Home (chọn ảnh/video) → Prepare (xem trước) → Processing → Result.

- **Ảnh**: phát hiện mặt → tiền xử lý → model → kết quả % thật/giả.
- **Video**: trích 10 khung → mỗi khung: phát hiện mặt + model → timeline các khung + kết luận chung.

## Thêm / đổi mô hình

1. Chép file `.tflite` vào `assets/models/`.
2. Thêm thông số vào `app/_config/modelSpecs.ts`.
3. Thêm require + id vào `app/_services/tfliteEngine.ts`.
4. Thêm vào `app/_config/models.ts` để hiện trong Cài đặt.
5. Build lại.

## Ghi chú

- Kết quả mang tính tham khảo kỹ thuật dựa trên xác suất của mô hình AI, không thay thế giám định pháp lý.
- Trên **điện thoại thật**, model chạy nhanh hơn emulator rất nhiều (vài trăm ms so với hàng chục giây).
- Toàn bộ xử lý diễn ra trên thiết bị; ảnh/video không rời khỏi máy.

