# DeepGuard — Frontend (Edge AI Deepfake Detector)

App React Native (Expo) phát hiện Deepfake, chạy Edge AI trên thiết bị.
Bản này là **frontend hoàn chỉnh với luồng mock** — chỗ nối model AI đã chừa sẵn,
chưa cần backend vẫn chạy và demo được.

## Cách chạy (làm đúng thứ tự)

1. Cài Node.js (>= 18) và Android Studio (đã có emulator).
2. Mở thư mục này trong VSCode, mở terminal, chạy:

   ```bash
   npm install
   ```

3. **Thay logo thật:** copy file logo mặt nạ của bạn vào `assets/logo.png`
   (hiện đang có 1 logo tạm để app chạy được ngay — cứ ghi đè).

4. Chạy app:

   ```bash
   npx expo start
   ```

   Bấm `a` để mở trên Android emulator (Android Studio phải đang mở emulator).

## Luồng màn hình

Onboarding (xin quyền) → Home (chọn ảnh/video) → Prepare (preview 10 frame)
→ Processing (4 bước) → Result (điểm số + bằng chứng) . Ngoài ra: Settings,
History, Privacy, About.

## Cấu trúc

```
app/
  _layout.tsx          điều hướng (expo-router)
  _store/appStore.ts   state toàn cục (zustand) + lưu bền (persist)
  _theme/              màu dark/light + hook useTheme
  _i18n/               song ngữ Việt/Anh + hook useT
  _config/models.ts    DANH SÁCH MODEL — thêm/bớt model sửa ở đây
  _services/analyzer.ts ⭐ ĐIỂM NỐI BACKEND (hiện trả mock)
  _types/index.ts      kiểu dữ liệu dùng chung
  _components/          component dùng chung
  *.tsx                các màn hình
assets/logo.png        logo app
```

## Khi model AI xong — nối backend

Chỉ cần sửa **1 file**: `app/_services/analyzer.ts`, hàm `analyzeMedia(...)`.
Tìm comment `// TODO: THAY MOCK BẰNG INFERENCE THẬT`.
Giữ nguyên chữ ký hàm → **toàn bộ UI không phải sửa gì**.

Model dùng ONNX (`onnxruntime-react-native`) hoặc TFLite đều được. Lưu ý:
khi nối inference thật, phải dùng Expo prebuild + dev client (không chạy Expo Go nữa).

## Thêm / đổi model

Mở `app/_config/models.ts`, thêm phần tử vào mảng `AI_MODELS`.
Màn Settings tự hiện thêm lựa chọn, không phải sửa UI.
```
```
