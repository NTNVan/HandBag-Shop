# Deploy VPS (Domain + SSL)

Tài liệu này hướng dẫn deploy bản Next.js + Supabase trong thư mục `web/` lên VPS với domain + HTTPS.

## Mục tiêu

- Chạy app bằng Docker (Compose)
- Reverse proxy ra domain
- SSL tự động

## 1) Chuẩn bị

- VPS Ubuntu 22.04/24.04
- Domain trỏ A record về IP VPS
- Supabase project đã chạy migrations:
  - `supabase/migrations/001_init.sql`
  - `supabase/migrations/002_storage.sql`

## 2) Cài Docker

Theo hướng dẫn chính thức Docker Engine. Tối thiểu cần:

- `docker`
- `docker compose` (plugin)

Kiểm tra:

- `docker --version`
- `docker compose version`

## 3) Deploy app

### 3.1 Copy source lên VPS

Ví dụ:

- Clone repo vào `/opt/handbag-shop`

### 3.2 Tạo env cho web

Tạo file `/opt/handbag-shop/web/.env` (tham khảo `web/.env.example`):

- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

### 3.3 Run docker compose

Tại thư mục `/opt/handbag-shop`:

- `docker compose up --build -d`

App sẽ listen nội bộ tại port `3000`.

## 4) Domain + SSL (Caddy recommended)

Caddy đơn giản vì tự xin/renew chứng chỉ TLS.

### 4.1 Cài Caddy

Cài theo hướng dẫn chính thức của Caddy.

### 4.2 Cấu hình reverse proxy

Tạo `/etc/caddy/Caddyfile`:

```
example.com {
  reverse_proxy 127.0.0.1:3000
}
```

- Thay `example.com` bằng domain thật.

Restart Caddy:

- `sudo systemctl restart caddy`

Kiểm tra:

- `https://example.com` vào được

## 5) Cloudflare (optional)

Nếu dùng Cloudflare:

- DNS: A record trỏ về VPS
- Có thể bật proxy (orange cloud)
- SSL mode khuyến nghị `Full (strict)`

## 6) Ghi chú bảo mật

- Không commit file `web/.env`
- Supabase RLS đã cấu hình trong migrations (bảo vệ dữ liệu theo user/admin)
