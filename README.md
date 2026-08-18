🛡️ DeepGuard — Edge AI Deepfake Detector
DeepGuard là ứng dụng di động phát hiện Deepfake chạy hoàn toàn trực tiếp trên thiết bị (On-Device/Edge AI), cam kết không gửi dữ liệu hình ảnh lên máy chủ. Đây là sản phẩm thuộc Đề tài Nghiên cứu Khoa học.

📲 Trải nghiệm nhanh (Tải APK)
Bản build Release mới nhất (APK) đã được biên dịch để mô hình AI chạy với hiệu năng tối đa trên thiết bị thật.

📥 Tải file APK DeepGuard tại đây

Lưu ý khi cài đặt:

Cần cấp quyền "Cài đặt ứng dụng từ nguồn không xác định" trong phần Cài đặt của điện thoại.

Nếu Google Play Protect cảnh báo, vui lòng chọn "Chi tiết khác" -> "Vẫn cài đặt".

✨ Tính năng nổi bật
Nhận diện Deepfake On-Device: Chạy trực tiếp các mô hình AI (TensorFlow Lite) trên điện thoại, không cần kết nối mạng để phân tích.

Tích hợp ML Kit Face Detection: Tự động phát hiện khuôn mặt để lọc rác (chặn các ảnh không có mặt hoặc có nhiều mặt).

Kết quả minh bạch: Trả về tỷ lệ % Fake / Real, kèm theo cảnh báo "Không chắc chắn" (Uncertain) nếu độ tin cậy thấp.

Đa Mô hình (Multi-model): Cho phép người dùng linh hoạt chuyển đổi giữa các model AI khác nhau ngay trong mục Settings.

UX/UI Hiện đại: Hỗ trợ giao diện Sáng/Tối (Light/Dark mode), song ngữ (Việt - Anh).

Tính năng phụ trợ: Lưu trữ lịch sử quét cục bộ, chia sẻ báo cáo kết quả, chính sách bảo mật rõ ràng.

🧠 Danh sách Mô hình AI (Models)
Ứng dụng hiện đang tích hợp 4 mô hình TensorFlow Lite, đáp ứng các tiêu chí khác nhau về tốc độ và độ chính xác:

msfv_lstm_float32.tflite (Tiêu chuẩn): Phân tích chuỗi 12 khung hình, huấn luyện trên tập dữ liệu Wild + DFDC/FF++/Celeb.

model_tlcnn_optimized.tflite (Nhanh): Phân tích dựa trên 1 ảnh tĩnh duy nhất, cho kết quả tức thì.

model_unified_robust.tflite (Ổn định): Khả năng chống nhiễu hình ảnh tốt, hoạt động ổn định trong nhiều điều kiện.

model_3d_mobilenet_optimized.tflite (Nhẹ nhất): Trích xuất và phân tích 10 khung hình với dung lượng model siêu nhẹ.

🛠 Công nghệ sử dụng
Framework: React Native 0.85, Expo SDK 56, TypeScript.

Routing & State: expo-router, Zustand (Lưu trữ bền/Persist).

AI & Machine Learning:

react-native-fast-tflite: Nạp và thực thi model .tflite bằng C++/JSI.

@react-native-ml-kit/face-detection: Đếm và bóc tách khuôn mặt.

⚙️ Hướng dẫn cài đặt (Development)
Vì ứng dụng sử dụng các thư viện Native (TFLite, ML Kit), KHÔNG THỂ chạy bằng ứng dụng Expo Go thông thường. Bạn cần build Custom Dev Client.

Yêu cầu hệ thống
Node.js >= 18

Android Studio (Đã cài đặt SDK & Emulator) hoặc thiết bị Android thật cắm cáp.

JDK (Sử dụng bản JBR đi kèm Android Studio).

Các bước chạy code
1. Cài đặt các gói phụ thuộc

Bash
npm install
2. Đặt biến môi trường JAVA_HOME (Trên Windows PowerShell)

PowerShell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
3. Khởi tạo cấu trúc Android (Prebuild)

Bash
npx expo prebuild --clean
4. FIX LỖI GRADLE (Rất quan trọng)

Mở file: android/gradle/wrapper/gradle-wrapper.properties

Sửa dòng distributionUrl thành phiên bản 8.13:
distributionUrl=https\://services.gradle.org/distributions/gradle-8.13-all.zip

5. Chép model vào thư mục Native (Nếu lệnh prebuild làm mất)

PowerShell
# Trên Windows
copy assets\models\*.tflite android\app\src\main\assets\
6. Build và chạy lên Emulator/Điện thoại
(Đảm bảo Emulator đang mở hoặc điện thoại đã bật USB Debugging)

Bash
npx expo run:android
💡 Mẹo: Các lần chạy sau (nếu không cài thêm thư viện Native nào mới), bạn chỉ cần gõ lệnh npx expo start --dev-client là đủ.

⚠️ Cấu hình Metro Config quan trọng
Để Expo Bundler có thể nhận diện và đóng gói file .tflite, file metro.config.js phải được thiết lập như sau:

JavaScript
const { getDefaultConfig } = require('expo/metro-config');
const config = getDefaultConfig(__dirname);
config.resolver.assetExts.push('tflite');
module.exports = config;
📂 Cấu trúc thư mục cốt lõi
Plaintext
app/
  ├── _layout.tsx              # Điều hướng chính (expo-router)
  ├── _store/appStore.ts       # Quản lý State toàn cục (Zustand)
  ├── _theme/                  # Quản lý giao diện Dark/Light
  ├── _i18n/                   # Đa ngôn ngữ (Việt/Anh)
  ├── _config/
  │   ├── models.ts            # Danh sách model hiển thị trong Settings
  │   └── modelSpecs.ts        # Thông số kỹ thuật (shape, chuẩn hóa, ngưỡng)
  ├── _services/
  │   ├── analyzer.ts          # Module điều phối (Crop mặt -> Tiền xử lý -> TFLite)
  │   ├── faceDetector.ts      # Đếm và lấy tọa độ khuôn mặt (ML Kit)
  │   ├── preprocess.ts        # Resize 224x224, chuẩn hóa tensor
  │   └── tfliteEngine.ts      # Nạp và chạy model
  └── *.tsx                    # Các màn hình (Screens)
assets/
  ├── logo.png
  └── models/                  # Thư mục chứa các file .tflite
🔄 Hướng dẫn Thêm/Đổi Model AI
Để tích hợp một model AI mới vào hệ thống, thực hiện các bước sau:

Chép file .tflite mới vào thư mục assets/models/.

Mở app/_config/modelSpecs.ts và khai báo cấu hình (numFrames, inputSize, normalize, outputType, threshold).

Mở app/_services/tfliteEngine.ts, cập nhật require và ID vào MODEL_REQUIRES.

Mở app/_config/models.ts để hiển thị tên và mô tả model mới trong tab Cài đặt.

Chạy lại lệnh build native: npx expo run:android.

📝 Ghi chú từ tác giả
Giá trị pháp lý: Kết quả phân tích của ứng dụng mang tính chất tham khảo kỹ thuật dựa trên xác suất toán học của AI, hoàn toàn không thay thế cho các giám định pháp lý chuyên nghiệp.

Hiệu năng: Tốc độ suy luận (Inference time) khi chạy trên Emulator (giả lập CPU) sẽ khá chậm. Để trải nghiệm tốc độ thực tế của Edge AI, vui lòng cài đặt file APK lên thiết bị điện thoại Android vật lý.