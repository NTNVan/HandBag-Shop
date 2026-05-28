# Mục 6 — Dockerize (Dockerfile + Docker Compose)

Mục tiêu của mục 6: bạn phải **chạy được app bằng Docker** với lệnh `docker compose up --build`.

Repo này đã có sẵn:

- Image production: [web/Dockerfile](../web/Dockerfile)
- Compose chạy từ root: [docker-compose.yml](../docker-compose.yml)
- Scripts tiện: xem `npm run docker:up` trong [package.json](../package.json)

## A) Cài Docker (Windows 10/11)

1. Bật ảo hoá (nếu cần)

- Vào BIOS/UEFI bật Virtualization (Intel VT-x / AMD-V)

2. Bật WSL2

Mở PowerShell (Admin) và chạy:

- `wsl --install`

Khởi động lại máy nếu được yêu cầu.

3. Cài Docker Desktop

- Tải Docker Desktop (Windows)
- Mở Docker Desktop và để nó chạy (Docker daemon phải running)

4. Kiểm tra

- `docker --version`
- `docker compose version`

Nếu `docker` không nhận, thường là Docker Desktop chưa cài đúng hoặc chưa mở.

## B) Chuẩn bị env cho Supabase

Compose (chạy từ root) lấy biến môi trường theo cơ chế chuẩn của Docker Compose:

- Ưu tiên đọc từ file `.env` ở **thư mục root** (cùng cấp với `docker-compose.yml`) nếu bạn tạo file này
- Hoặc bạn export biến môi trường trong terminal trước khi chạy compose

Bạn nên điền 2 biến tối thiểu để app load dữ liệu thật:

- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`

Nếu để trống, container vẫn có thể chạy nhưng UI sẽ báo thiếu env.

### Cách 1: Tạo file `.env` ở root (khuyến nghị)

Copy file [../.env.example](../.env.example) thành `./.env` (root), sau đó điền giá trị thật.

Hoặc tự tạo file `./.env` (root) với nội dung:

- `NEXT_PUBLIC_SUPABASE_URL=...`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

File này đã được ignore trong git (không push lên GitHub).

### Cách 2: Set env trực tiếp trong terminal

PowerShell ví dụ:

- `$env:NEXT_PUBLIC_SUPABASE_URL="..."`
- `$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="..."`
- `$env:NEXT_PUBLIC_SITE_URL="http://localhost:3000"`

## C) Chạy Docker Compose

Mở terminal tại thư mục project (root) và chạy:

- `docker compose up --build`

Sau đó mở:

- `http://localhost:3000`

### Chạy bản legacy (Express + HTML) trong Docker (giao diện “bình thường”)

Repo có 2 bản app:

- Next.js + Supabase (mặc định): dùng [../docker-compose.yml](../docker-compose.yml)
- Legacy Express + HTML (giống giao diện root `index.html`/`admin.html`): dùng [../docker-compose.legacy.yml](../docker-compose.legacy.yml)

Chạy legacy bằng Docker:

- `docker compose -f docker-compose.legacy.yml up --build`

Mở:

- `http://localhost:3001` (mặc định)

Nếu bạn muốn legacy chiếm luôn port 3000 (giống khi chạy `npm start` ở root), hãy dừng compose Next.js trước (hoặc set `LEGACY_PORT=3000`).

Dừng app:

- `docker compose down`

## D) Troubleshooting nhanh

### 1) Lỗi: `docker: command not found`

- Docker Desktop chưa cài / chưa mở
- Cài Docker Desktop và mở lên rồi thử lại.

### 2) Lỗi: “Cannot connect to the Docker daemon”

- Docker Desktop chưa chạy
- Mở Docker Desktop, đợi status Ready rồi chạy lại.

### 3) Lỗi: Port 3000 đang bị dùng

Bạn có 2 cách:

- Tắt process đang dùng 3000
- Hoặc đổi port mapping trong [docker-compose.yml](../docker-compose.yml) từ `"3000:3000"` thành `"3001:3000"`, rồi truy cập `http://localhost:3001`

### 4) Lỗi: upload ảnh không được

Mục upload phụ thuộc Supabase Storage:

- Đã chạy migration [supabase/migrations/002_storage.sql](../supabase/migrations/002_storage.sql)
- Đã tạo bucket `product-images` trong Supabase Dashboard

## E) Minh chứng để “chốt mục 6”

- Screenshot terminal: `docker compose up --build` chạy OK
- Screenshot trình duyệt: `http://localhost:3000` mở được
- (Tuỳ yêu cầu) screenshot `docker ps` thấy container `web` đang chạy
