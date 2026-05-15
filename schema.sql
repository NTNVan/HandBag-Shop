-- SQL Server Database Schema for Handbag Shop
-- Tạo database và các bảng cho website bán túi xách

-- Tạo database (chạy lệnh này trước)
CREATE DATABASE HandbagShopDB;
GO
USE HandbagShopDB;
GO

-- Bảng Admins - Quản trị viên
CREATE TABLE Admins (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    fullname NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE()
);

-- Bảng Users - Người dùng/Khách hàng
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(50) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    fullname NVARCHAR(100) NOT NULL,
    email NVARCHAR(100),
    phone NVARCHAR(20),
    address NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Bảng Products - Sản phẩm túi xách
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    type NVARCHAR(50) NOT NULL,
    material NVARCHAR(50),
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    image_url NVARCHAR(500),
    description NVARCHAR(1000),
    size NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Bảng Cart - Giỏ hàng
CREATE TABLE Cart (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Bảng Favorites - Sản phẩm yêu thích
CREATE TABLE Favorites (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

-- Bảng Reviews - Đánh giá sản phẩm
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(1000),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Bảng Vouchers - Mã giảm giá
CREATE TABLE Vouchers (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    discount_type NVARCHAR(20) NOT NULL, -- 'percentage' hoặc 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2) NULL,
    usage_limit INT DEFAULT 0, -- 0 = không giới hạn
    used_count INT DEFAULT 0,
    valid_from DATETIME DEFAULT GETDATE(),
    valid_to DATETIME NOT NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);

-- Bảng Orders - Đơn hàng
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NULL,
    customer_name NVARCHAR(100) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    address NVARCHAR(500) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    final_amount DECIMAL(10, 2) NOT NULL,
    voucher_code NVARCHAR(50) NULL,
    status NVARCHAR(50) DEFAULT N'Chờ xác nhận',
    payment_method NVARCHAR(50) DEFAULT 'COD',
    payment_status NVARCHAR(50) DEFAULT N'Chưa thanh toán',
    tracking_code NVARCHAR(100) NULL,
    estimated_delivery DATETIME NULL,
    notes NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id)
);

-- Bảng OrderItems - Chi tiết đơn hàng
CREATE TABLE OrderItems (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name NVARCHAR(200) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id)
);

-- Tạo indexes
CREATE INDEX idx_products_type ON Products(type);
CREATE INDEX idx_products_material ON Products(material);
CREATE INDEX idx_products_price ON Products(price);
CREATE INDEX idx_orders_status ON Orders(status);
CREATE INDEX idx_orders_user_id ON Orders(user_id);
CREATE INDEX idx_cart_user_id ON Cart(user_id);
CREATE INDEX idx_favorites_user_id ON Favorites(user_id);
CREATE INDEX idx_reviews_product_id ON Reviews(product_id);
CREATE INDEX idx_vouchers_code ON Vouchers(code);

-- Dữ liệu mẫu Admin (username: admin, password: admin123)
INSERT INTO Admins (username, password, fullname) VALUES 
('admin', 'admin123', N'Quản trị viên');

-- Dữ liệu mẫu Users (username: user1, password: user123)
INSERT INTO Users (username, password, fullname, email, phone, address) VALUES 
('user1', 'user123', N'Nguyễn Văn A', 'user1@example.com', '0901234567', N'123 Đường ABC, Quận 1, TP.HCM');

-- Dữ liệu mẫu Vouchers
INSERT INTO Vouchers (code, discount_type, discount_value, min_order_amount, max_discount, usage_limit, valid_from, valid_to) VALUES
('WELCOME10', 'percentage', 10, 100000, 50000, 100, GETDATE(), DATEADD(month, 3, GETDATE())),
('FREESHIP', 'fixed', 30000, 200000, NULL, 0, GETDATE(), DATEADD(month, 6, GETDATE())),
('SALE50K', 'fixed', 50000, 500000, NULL, 50, GETDATE(), DATEADD(month, 1, GETDATE()));

-- Dữ liệu mẫu Products
INSERT INTO Products (name, type, material, price, quantity, image_url, description, size) VALUES
(N'Túi Tote Canvas Hoa Hồng', 'tote', N'vải', 250000, 15, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', N'Túi tote nữ phong cách Hàn Quốc, chất vải canvas bền đẹp', '35x40x12cm'),
(N'Túi Đeo Chéo Mini Da Thật', 'crossbody', N'da', 450000, 8, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', N'Túi đeo chéo mini sang trọng, chất liệu da PU cao cấp', '18x15x8cm'),
(N'Balo Nữ Pastel Xinh Xắn', 'backpack', N'vải', 680000, 12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', N'Balo nữ nhiều ngăn tiện dụng, màu pastel nhẹ nhàng', '28x38x15cm'),
(N'Túi Xách Công Sở Cao Cấp', 'tote', N'da', 890000, 6, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', N'Túi xách công sở thanh lịch, da PU cao cấp', '32x28x10cm'),
(N'Túi Đeo Chéo Boho Vintage', 'crossbody', N'cotton', 190000, 20, 'https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=400', N'Túi đeo chéo phong cách boho vintage', '22x18x6cm'),
(N'Mini Tote Vải Đơn Giản', 'tote', N'vải', 180000, 25, 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400', N'Túi tote mini đơn giản tiện lợi, nhẹ gọn', '25x30x8cm'),
(N'Túi Đeo Chéo Nắp Gập', 'crossbody', N'da', 380000, 10, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400', N'Túi đeo chéo nắp gập thời trang, khóa nam châm', '20x16x7cm'),
(N'Balo Nữ Đi Học Hàn Quốc', 'backpack', N'vải', 550000, 14, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400', N'Balo nữ style Hàn Quốc, nhiều ngăn chứa', '30x42x16cm'),
(N'Túi Tote Da Phối Vải', 'tote', N'da', 420000, 9, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', N'Túi tote phối da và vải độc đáo', '30x35x12cm'),
(N'Túi Đeo Chéo Hộp Vuông', 'crossbody', N'da', 320000, 11, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', N'Túi đeo chéo hình hộp vuông trendy', '16x16x8cm'),
(N'Balo Nữ Mini Dạo Phố', 'backpack', N'vải', 380000, 18, 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=400', N'Balo mini xinh xắn cho nữ, gọn nhẹ dạo phố', '22x28x12cm'),
(N'Túi Tote Vải Canvas Trơn', 'tote', N'vải', 160000, 30, 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400', N'Túi tote canvas trơn basic, dễ phối đồ', '33x38x10cm');
