export const vi = {
  // chung
  'app.name': 'DeepGuard',
  'common.back': 'Quay lại',
  'common.agree': 'Tôi đồng ý',
  'common.details': 'Xem chi tiết',
  'common.cancel': 'Hủy',
  'common.continue': 'Tiếp tục',

  // onboarding
  'onboard.slogan': 'Bảo vệ sự thật số của bạn — ngay trên thiết bị',
  'onboard.privacyLine': 'Video và ảnh của bạn không bao giờ rời khỏi thiết bị này.',
  'onboard.permTitle': 'Cấp quyền truy cập',
  'onboard.permCamera': 'Máy ảnh — để quay/chụp trực tiếp',
  'onboard.permLibrary': 'Thư viện — để chọn ảnh/video có sẵn',
  'onboard.start': 'Bắt đầu',
  'onboard.permDenied': 'Bạn đã từ chối quyền. Hãy vào Cài đặt để cấp lại quyền Máy ảnh và Thư viện.',
  'onboard.openSettings': 'Mở Cài đặt',

  // home
  'home.placeholder': 'Chụp, chọn ảnh hoặc video\nđể kiểm tra',
  'home.takePhoto': 'Chụp ảnh mới',
  'home.pickImage': 'Chọn ảnh',
  'home.pickVideo': 'Chọn video',
  'home.analyze': 'PHÂN TÍCH NGAY',
  'home.privacyTitle': 'Cam kết bảo mật',
  'home.privacyText':
    'Ảnh và video của bạn chỉ được phân tích cục bộ trên thiết bị. Chúng tôi không lưu trữ hoặc chia sẻ khi chưa có sự đồng ý.',

  // prepare
  'prepare.title': 'Chuẩn bị dữ liệu',
  'prepare.faceFound': 'Đã phát hiện khuôn mặt',
  'prepare.noFace': 'Chưa chắc chắn có khuôn mặt rõ ràng',
  'prepare.framesTitle': 'Xem trước 10 khung hình',
  'prepare.framesHint': 'Hệ thống trích đều 10 khung hình để phân tích chuỗi thời gian.',
  'prepare.framesHintImage': 'Với ảnh tĩnh, mô hình phân tích cùng một khung ở nhiều mức đặc trưng.',
  'prepare.start': 'Bắt đầu phân tích AI',

  // processing
  'processing.title': 'Đang phân tích...',
  'processing.sub': 'Hệ thống AI đang quét đặc điểm khuôn mặt. Vui lòng không đóng ứng dụng.',
  'processing.step1': 'Trích khuôn mặt & chuẩn hóa',
  'processing.step2': 'Trích đặc trưng không gian',
  'processing.step3': 'Phân tích chuỗi thời gian',
  'processing.step4': 'Tính xác suất giả mạo',

  // error handling
  'error.noFaceTitle': 'Không tìm thấy khuôn mặt',
  'error.noFaceBody': 'Không phát hiện khuôn mặt rõ ràng. Vui lòng chọn ảnh/video có góc mặt trực diện và đủ ánh sáng.',
  'error.multiFaceTitle': 'Phát hiện nhiều khuôn mặt',
  'error.multiFaceBody': 'Ảnh có nhiều hơn 1 khuôn mặt. Vui lòng chọn ảnh chỉ có 1 khuôn mặt để phân tích chính xác.',
  'error.genericTitle': 'Đã xảy ra lỗi',
  'error.genericBody': 'Không thể hoàn tất phân tích. Vui lòng thử lại.',

  // result
  'result.real': 'CÓ KHẢ NĂNG THẬT',
  'result.fake': 'PHÁT HIỆN DEEPFAKE',
  'result.scoreLabel': 'Chỉ số xác thực',
  'result.confidence': 'Độ tin cậy',
  'result.techTitle': 'Chi tiết kỹ thuật',
  'result.faces': 'Khuôn mặt',
  'result.blur': 'Blur Score',
  'result.frequency': 'Phân tích tần số',
  'result.confidenceShort': 'Độ tin cậy',
  'result.warning': 'Cảnh báo',
  'result.evidenceTitle': 'Bằng chứng trực quan',
  'result.evidenceHint': 'Khung viền đỏ là nơi mô hình thấy bất thường rõ nhất.',
  'result.anomaly': 'Bất thường cao',
  'result.latency': 'Thời gian suy luận',
  'result.model': 'Mô hình',
  'result.scanAgain': 'Quét ảnh khác',
  'result.share': 'Chia sẻ báo cáo',
  'result.blurWarn': 'Chất lượng nén thấp, kết quả có thể giảm độ chính xác.',

  // settings
  'settings.title': 'Cài đặt',
  'settings.aiGroup': 'Lõi AI',
  'settings.threshold': 'Ngưỡng nhạy',
  'settings.thresholdHint': 'Cao hơn = ít báo giả mạo hơn.',
  'settings.dataGroup': 'Dữ liệu & lưu trữ',
  'settings.saveThumb': 'Lưu ảnh kết quả',
  'settings.blurWarn': 'Cảnh báo ảnh mờ',
  'settings.clearData': 'Xóa bộ nhớ đệm & lịch sử',
  'settings.generalGroup': 'Giao diện & thông tin',
  'settings.theme': 'Giao diện tối',
  'settings.language': 'Ngôn ngữ',
  'settings.history': 'Lịch sử quét',
  'settings.privacy': 'Chính sách bảo mật',
  'settings.about': 'Về chúng tôi',

  // history
  'history.title': 'Lịch sử quét',
  'history.empty': 'Chưa có dữ liệu lịch sử',
  'history.clearConfirm': 'Xóa toàn bộ lịch sử?',

  // privacy
  'privacy.title': 'Chính sách bảo mật',
  'privacy.body':
    'Tại DeepGuard, chúng tôi coi trọng sự riêng tư của bạn. Dữ liệu bạn tải lên được xử lý như sau:\n\n1. Xử lý cục bộ: Toàn bộ phân tích chạy trực tiếp trên thiết bị của bạn.\n\n2. Không lưu trữ: Chúng tôi không lưu ảnh/video của bạn lên máy chủ.\n\n3. Bảo mật dữ liệu: Mọi dữ liệu đều nằm trên thiết bị.\n\n4. Quyền kiểm soát: Bạn có thể xóa toàn bộ lịch sử bất cứ lúc nào trong Cài đặt.',

  // about
  'about.title': 'Về chúng tôi',
  'about.desc':
    'DeepGuard là ứng dụng phát hiện Deepfake chạy trực tiếp trên thiết bị (Edge AI), giúp bạn kiểm tra tính xác thực của ảnh và video một cách riêng tư.',
  'about.disclaimer':
    'Kết quả phân tích mang tính tham khảo kỹ thuật dựa trên xác suất của mô hình AI, không thay thế giám định pháp lý chính thức.',
  'about.footer': '© 2026 DeepGuard Team.',

  // model descriptions
  'model.mvit_fp16.desc': 'Nhẹ, nhanh — tiết kiệm RAM',
  'model.mvit_fp32.desc': 'Chính xác cao nhất',
  'model.msfv_dfdc.desc': 'Huấn luyện trên bộ DFDC',
  'model.msfv_ffpp.desc': 'Huấn luyện trên bộ FaceForensics++',
  'model.msfv_lstm_wild.desc': 'Huấn luyện Wild + cross DFDC/FF++/Celeb',
};

export type TranslationKey = keyof typeof vi;
