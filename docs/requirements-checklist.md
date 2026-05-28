# Checklist hoàn thành yêu cầu quy chế (không bao gồm báo cáo)

Mục tiêu: tick đủ để chắc chắn "đạt yêu cầu tối thiểu" theo QUY-CHE-THI-CUOI-KY.

## 1) Next.js App Router + TypeScript + Tailwind

- [ ] Chạy được `npm --prefix web run dev` và vào `http://localhost:3000`
- [ ] `npm --prefix web run build` chạy pass

## 2) Supabase (Auth + Database)

- [ ] Tạo Supabase project
- [ ] Chạy migrations trong SQL Editor:
  - [ ] [../supabase/migrations/001_init.sql](../supabase/migrations/001_init.sql)
  - [ ] [../supabase/migrations/002_storage.sql](../supabase/migrations/002_storage.sql)
- [ ] Set env chạy app:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3) Supabase tính năng bổ sung (Storage)

- [ ] Bucket `product-images` tồn tại
  - Lưu ý: migration 002 cố gắng tạo bucket tự động; nếu Supabase policy chặn, tạo bucket trong Dashboard.
- [ ] Upload ảnh sản phẩm chạy được trong trang admin

## 4) RLS / Phân quyền

- [ ] User thường chỉ xem/đặt hàng được dữ liệu của họ
- [ ] Chỉ admin mới tạo/sửa/xóa sản phẩm và đổi trạng thái đơn
- [ ] Có ít nhất 1 tài khoản admin (`profiles.role = 'admin'`)

## 5) Dockerize (Dockerfile + Docker Compose)

- [ ] Tạo `.env` từ [../.env.example](../.env.example)
- [ ] Chạy được: `docker compose up --build`
- [ ] Mở được `http://localhost:3000`

## 6) Deployment VPS + domain + SSL (URL thật)

- [ ] Domain trỏ A record về IP VPS
- [ ] Chạy được app trên VPS bằng Docker
- [ ] Mở được `https://<domain>` từ mạng ngoài
- [ ] Gợi ý triển khai:
  - [ ] Host Caddy (xem [vps-deploy.md](vps-deploy.md))
  - [ ] Hoặc Docker + Caddy (dùng [../docker-compose.vps.yml](../docker-compose.vps.yml))

## 7) Git/GitHub commit history

- [ ] Repo có commit history rõ ràng (Conventional commits)

## 8) Minh chứng AI tool (>5 prompts)

- [ ] Có log prompts trong [ai-prompts.md](ai-prompts.md)
- [ ] (Nếu giảng viên yêu cầu) xuất bảng phụ lục prompts (Excel/Word)
