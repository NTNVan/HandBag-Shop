# 🛍️ WEBSITE BÁN TÚI XÁCH

Website bán túi xách đơn giản với đầy đủ tính năng cho khách hàng và quản trị viên.

## ✅ Bản Next.js + Supabase (mục 2.1)

Thư mục `web/` là bản triển khai theo stack Next.js + TypeScript + Tailwind + Supabase.

- Chạy local: xem `web/README.md`
- SQL migrations Supabase: `supabase/migrations/*`

### Chạy nhanh (root)

- Dev: `npm run web:dev`
- Build: `npm run web:build`
- Docker: `npm run docker:up`

### Deploy VPS

- Xem: `docs/vps-deploy.md`

## (Legacy) Express app

## 🎯 Tính Năng

### Khách Hàng

- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Lọc theo loại túi, chất liệu, giá
- ✅ Tìm kiếm sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thêm, xóa, thay đổi số lượng)
- ✅ Đặt hàng với thông tin giao hàng
- ✅ Theo dõi trạng thái đơn hàng

### Quản Trị Viên

- ✅ Đăng nhập admin với xác thực
- ✅ Quản lý sản phẩm (thêm, sửa, xóa)
- ✅ Upload hình ảnh sản phẩm
- ✅ Quản lý đơn hàng
- ✅ Xác nhận và cập nhật trạng thái đơn hàng
- ✅ Xem chi tiết đơn hàng

## 💻 Công Nghệ Sử Dụng

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Yêu Cầu Hệ Thống

- Node.js >= 14.x
- SQL Server 2019 hoặc cao hơn
- npm hoặc yarn

## 🚀 Hướng Dẫn Cài Đặt

### Bước 1: Cài Đặt SQL Server

1. Tải và cài đặt SQL Server từ [Microsoft](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
2. Cài đặt SQL Server Management Studio (SSMS) để quản lý database

### Bước 2: Tạo Database

1. Mở SQL Server Management Studio
2. Kết nối với SQL Server instance của bạn
3. Mở file `schema.sql` trong thư mục dự án
4. Thực thi toàn bộ script để tạo database và các bảng

Hoặc chạy từng câu lệnh SQL:

```sql
-- Tạo database
CREATE DATABASE handbag_shop;
GO

USE handbag_shop;
GO

-- Chạy các câu lệnh CREATE TABLE trong schema.sql
```

### Bước 3: Cấu Hình Kết Nối Database

1. Mở file `.env` trong thư mục dự án
2. Cập nhật thông tin kết nối SQL Server:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=handbag_shop
DB_USER=sa
DB_PASSWORD=YourPassword123
```

**Lưu ý**: Thay đổi `DB_PASSWORD` thành mật khẩu SQL Server của bạn.

### Bước 4: Cài Đặt Dependencies

Mở terminal/command prompt tại thư mục dự án và chạy:

```bash
npm install
```

### Bước 5: Khởi Động Server

```bash
npm start
```

Hoặc sử dụng nodemon để tự động reload khi có thay đổi:

```bash
npm run dev
```

Server sẽ chạy tại: `http://localhost:3000`

## 📱 Sử Dụng Website

### Khách Hàng

1. Truy cập: `http://localhost:3000`
2. Xem danh sách sản phẩm
3. Sử dụng bộ lọc và tìm kiếm để tìm sản phẩm mong muốn
4. Click vào sản phẩm để xem chi tiết
5. Thêm sản phẩm vào giỏ hàng
6. Click vào "Giỏ hàng" để xem và quản lý
7. Click "Thanh toán" để điền thông tin và đặt hàng
8. Sử dụng số điện thoại để tra cứu đơn hàng

### Quản Trị Viên

1. Truy cập: `http://localhost:3000/admin.html`
2. Đăng nhập với tài khoản:
   - **Username**: `admin`
   - **Password**: `admin123`
3. Quản lý sản phẩm:
   - Thêm sản phẩm mới
   - Cập nhật thông tin sản phẩm
   - Xóa sản phẩm
4. Quản lý đơn hàng:
   - Xem danh sách đơn hàng
   - Cập nhật trạng thái đơn hàng
   - Xem chi tiết đơn hàng

## 📁 Cấu Trúc Thư Mục

```
handbag-shop/
├── app.js              # Server Node.js với Express APIs
├── db.js               # Cấu hình kết nối SQL Server
├── schema.sql          # Database schema
├── index.html          # Trang chủ khách hàng
├── index.js            # JavaScript cho trang khách hàng
├── admin.html          # Trang quản trị
├── admin.js            # JavaScript cho trang admin
├── styles.css          # CSS cho toàn bộ website
├── package.json        # Node.js dependencies
├── .env               # Cấu hình môi trường
└── README.md          # File hướng dẫn này
```

## 🔐 Bảo Mật

- Admin sử dụng JWT token để xác thực
- Mật khẩu được mã hóa bằng bcrypt
- Thay đổi `JWT_SECRET` trong file `.env` khi deploy production
- Không commit file `.env` lên Git

## 🎨 Giao Diện

- Thiết kế responsive, hoạt động tốt trên mobile và desktop
- Sử dụng màu pastel phù hợp với shop túi xách
- Hiệu ứng hover và transition mượt mà
- Layout hiện đại, thân thiện với người dùng

## 📊 Database Schema

### Bảng `products`

- `id`: Primary key
- `name`: Tên sản phẩm
- `type`: Loại túi (tote, crossbody, backpack)
- `material`: Chất liệu
- `price`: Giá
- `stock`: Số lượng tồn kho
- `image_url`: Link hình ảnh
- `description`: Mô tả

### Bảng `orders`

- `id`: Primary key
- `customer_name`: Tên khách hàng
- `phone`: Số điện thoại
- `address`: Địa chỉ giao hàng
- `total_amount`: Tổng tiền
- `status`: Trạng thái đơn hàng
- `created_at`: Thời gian tạo

### Bảng `order_items`

- `id`: Primary key
- `order_id`: Foreign key tới orders
- `product_id`: Foreign key tới products
- `quantity`: Số lượng
- `price`: Giá tại thời điểm đặt

### Bảng `admins`

- `id`: Primary key
- `username`: Tên đăng nhập
- `password`: Mật khẩu đã mã hóa
- `created_at`: Thời gian tạo

## 🔧 API Endpoints

### Products

- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/admin/products` - Thêm sản phẩm mới (cần auth)
- `PUT /api/admin/products/:id` - Cập nhật sản phẩm (cần auth)
- `DELETE /api/admin/products/:id` - Xóa sản phẩm (cần auth)

### Orders

- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `GET /api/admin/orders` - Lấy tất cả đơn hàng (cần auth)
- `PUT /api/admin/orders/:id/status` - Cập nhật trạng thái (cần auth)
- `DELETE /api/admin/orders/:id` - Xóa đơn hàng (cần auth)

### Admin

- `POST /api/admin/login` - Đăng nhập admin

## 🐛 Xử Lý Lỗi

Nếu gặp lỗi kết nối database:

1. Kiểm tra SQL Server đã chạy chưa
2. Kiểm tra thông tin kết nối trong file `.env`
3. Đảm bảo database `handbag_shop` đã được tạo
4. Kiểm tra firewall có block port 1433 không

## 📝 Ghi Chú

- Dữ liệu mẫu sẽ được tự động thêm vào khi chạy script `schema.sql`
- Có thể thay đổi port server trong file `.env`
- Hình ảnh sản phẩm sử dụng URL, có thể upload lên cloud storage như Cloudinary, AWS S3

## 🚀 Deploy Production

1. Cập nhật các biến môi trường trong `.env`
2. Sử dụng dịch vụ hosting như Azure, AWS, DigitalOcean
3. Cấu hình SSL certificate cho HTTPS
4. Sử dụng SQL Server trên cloud (Azure SQL Database)
5. Thay đổi `JWT_SECRET` thành giá trị mạnh và bảo mật

## 📧 Liên Hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ qua email hoặc tạo issue trên GitHub.

---

Made with ❤️ for handbag lovers
