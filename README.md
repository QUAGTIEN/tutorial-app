# Kiểm tra nhanh

Website Next.js dùng Firebase Authentication và Cloud Firestore. Giáo viên đăng nhập bằng Email/Password; học sinh vào bằng Anonymous Authentication.

## Thiết lập Firebase

1. Trong Authentication → Sign-in method, bật Email/Password và Anonymous.
2. Tạo Cloud Firestore, rồi thay Rules mặc định bằng nội dung trong [`firestore.rules`](firestore.rules) và bấm Publish.
3. Trong Authentication → Settings → Authorized domains, thêm domain Vercel của dự án.

Firebase Web app config và UID giáo viên đã được cấu hình trong source. Đây là các định danh công khai; không đặt service-account key trong source.

## Deploy lên Vercel

Import repo này vào Vercel. [`vercel.json`](vercel.json) chọn Next.js, chạy `npm run build` và dùng `.next` làm output.

Trong Environment Variables của môi trường Production, chỉ cần một biến loại **Secret**:

| Key | Value |
| --- | --- |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Toàn bộ nội dung file JSON tải từ Firebase → Project settings → Service accounts → Generate new private key |

Không commit file JSON hay `.env.local`. Sau khi thêm biến, redeploy bản mới. Nếu đổi biến sau khi deploy, cần redeploy để function nhận giá trị mới.

## Chạy trên máy

Tạo `.env.local` và đặt `FIREBASE_SERVICE_ACCOUNT_JSON` bằng JSON một dòng, rồi chạy `npm ci` và `npm run dev`. Không có biến này, giao diện và đăng nhập vẫn mở được nhưng API chấm bài sẽ không hoạt động.
