# AI Prompts / Evidence Log

Mục tiêu: lưu lại prompt + phản hồi quan trọng (phục vụ minh chứng quá trình làm việc với AI).

## Template

### 1) Task

- Date:
- Goal:
- Context/files:

### 2) Prompt

```
(dán prompt bạn đã dùng)
```

### 3) Output summary

- What changed:
- Files touched:
- Commands ran:

### 4) Notes

- Tradeoffs:
- Follow-ups:

---

## Log (>= 5 prompts)

### Prompt 1 — Run UI / smoke test

- Date: 2026-05-15
- Prompt:

```
chạy giao diện handbag_shop
```

- Output summary:
  - Chạy app local, kiểm tra route/hiển thị sản phẩm

### Prompt 2 — Read requirements PDF

- Date: 2026-05-15
- Prompt:

```
đọc file QUY-CHE-THI-CUOI-KY.pdf được không
```

- Output summary:
  - Extract PDF → txt (`QUY-CHE-THI-CUOI-KY.txt`) và tóm tắt yêu cầu

### Prompt 3 — Gap analysis theo mục 2.1/3.2

- Date: 2026-05-15
- Prompt:

```
kiểm tra xem handbagshop đã…/thiếu… theo mục 1.3, 2.1, 3.2; liệt kê ra những gì còn thiếu
```

- Output summary:
  - Audit repo, xác định thiếu stack 2.1 và các mục deploy/Docker/RLS

### Prompt 4 — Implement Next.js + TS + Tailwind + Supabase

- Date: 2026-05-15
- Prompt:

```
bổ sung từng yêu cầu trong mục này vào handbagshop … Thiếu theo mục 2.1 – CÔNG NGHỆ BẮT BUỘC
```

- Output summary:
  - Tạo app trong `web/` (App Router)
  - Tích hợp Supabase Auth/DB/RLS/Storage
  - Thêm trang products/orders/admin + server actions

### Prompt 5 — Fix Next build error (Server/Client boundary)

- Date: 2026-05-15
- Prompt:

```
Build đang fail vì checkout là client component nhưng import Header/server; tách lại để build OK
```

- Output summary:
  - Tách `CheckoutClient` và giữ `checkout/page.tsx` là server component
  - `npm --prefix web run build` pass

### Prompt 6 — Docker + compose + docs

- Date: 2026-05-15
- Prompt:

```
Thêm Dockerfile + docker-compose cho Next app và hướng dẫn deploy
```

- Output summary:
  - Thêm `web/Dockerfile`, `web/docker-compose.yml`, docs `docs/vps-deploy.md`
  - Thêm root `docker-compose.yml` để chạy bằng `docker compose up --build`
