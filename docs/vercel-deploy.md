# Deploy Vercel (URL thật + HTTPS)

Tài liệu này dùng để tạo "bằng chứng deploy" khi bạn deploy bản Next.js + Supabase (thư mục `web/`) lên Vercel.

> Lưu ý: Quy chế ghi "Deploy lên VPS + domain + SSL". Vercel cung cấp URL thật + HTTPS nhưng có thể **không** được tính là VPS.
> Hãy hỏi giảng viên xem Vercel có được chấp nhận thay cho VPS không.

## 1) Những thứ cần có

- Repo GitHub đã push
- Supabase project đã chạy migrations:
  - `supabase/migrations/001_init.sql`
  - `supabase/migrations/002_storage.sql`

## 2) Cấu hình Environment Variables trên Vercel

Tối thiểu:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- (Tuỳ chọn) `NEXT_PUBLIC_SITE_URL` = `https://<your-vercel-domain>`

Không set các biến nhạy cảm kiểu `SUPABASE_SERVICE_ROLE_KEY` lên Vercel nếu không thật sự cần.

## 3) Bằng chứng để nộp/demo

- Live URL: `https://<your-app>.vercel.app`
- Verify command (Windows):

`curl.exe -I https://<your-app>.vercel.app`

Kỳ vọng:

- `HTTP/1.1 200 OK` (hoặc `308/301` redirect hợp lệ về HTTPS)

Khuyến nghị thêm:

- Screenshot trang web chạy thật
- Screenshot Vercel dashboard (Deployment successful)

## 4) Debug nhanh

- Nếu UI báo thiếu env: kiểm tra Vercel Environment Variables (Production/Preview) và redeploy.
- Nếu Auth/login lỗi: kiểm tra Supabase URL/Anon key đúng project.
