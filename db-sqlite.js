// SQLite Database - Fallback khi SQL Server không khả dụng
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'handbag-shop.db');
const db = new Database(dbPath);

// Tạo bảng
function initDatabase() {
  console.log('🔄 Đang khởi tạo SQLite database...');

  // Admins
  db.exec(`
    CREATE TABLE IF NOT EXISTS Admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullname TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users
  db.exec(`
    CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      fullname TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS Products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      material TEXT,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      image_url TEXT,
      description TEXT,
      size TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Orders
  db.exec(`
    CREATE TABLE IF NOT EXISTS Orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      total_amount REAL NOT NULL,
      discount_amount REAL DEFAULT 0,
      final_amount REAL NOT NULL,
      voucher_code TEXT,
      status TEXT DEFAULT 'Chờ xác nhận',
      payment_method TEXT DEFAULT 'COD',
      payment_status TEXT DEFAULT 'Chưa thanh toán',
      tracking_code TEXT,
      estimated_delivery DATETIME,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // OrderItems
  db.exec(`
    CREATE TABLE IF NOT EXISTS OrderItems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES Products(id)
    )
  `);

  // Insert admin nếu chưa có
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM Admins WHERE username = ?').get('admin');
  if (adminCount.count === 0) {
    db.prepare('INSERT INTO Admins (username, password, fullname) VALUES (?, ?, ?)').run('admin', 'admin123', 'Quản trị viên');
    console.log('✅ Đã tạo admin: admin/admin123');
  }

  // Insert products nếu chưa có
  const productCount = db.prepare('SELECT COUNT(*) as count FROM Products').get();
  if (productCount.count === 0) {
    const products = [
      ['Túi Tote Canvas Hoa Hồng', 'tote', 'vải', 250000, 15, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400', 'Túi tote nữ phong cách Hàn Quốc, chất vải canvas bền đẹp', '35x40x12cm'],
      ['Túi Đeo Chéo Mini Da Thật', 'crossbody', 'da', 450000, 8, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400', 'Túi đeo chéo mini sang trọng, chất liệu da PU cao cấp', '18x15x8cm'],
      ['Balo Nữ Pastel Xinh Xắn', 'backpack', 'vải', 680000, 12, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'Balo nữ nhiều ngăn tiện dụng, màu pastel nhẹ nhàng', '28x38x15cm'],
      ['Túi Xách Công Sở Cao Cấp', 'tote', 'da', 890000, 6, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400', 'Túi xách công sở thanh lịch, da PU cao cấp', '32x28x10cm'],
      ['Túi Đeo Chéo Boho Vintage', 'crossbody', 'cotton', 190000, 20, 'https://images.unsplash.com/photo-1564422170194-896b89110ef8?w=400', 'Túi đeo chéo phong cách boho vintage', '22x18x6cm'],
      ['Mini Tote Vải Đơn Giản', 'tote', 'vải', 180000, 25, 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=400', 'Túi tote mini đơn giản tiện lợi, nhẹ gọn', '25x30x8cm'],
      ['Túi Đeo Chéo Nắp Gập', 'crossbody', 'da', 380000, 10, 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=400', 'Túi đeo chéo nắp gập thời trang, khóa nam châm', '20x16x7cm'],
      ['Balo Nữ Đi Học Hàn Quốc', 'backpack', 'vải', 550000, 14, 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=400', 'Balo nữ style Hàn Quốc, nhiều ngăn chứa', '30x42x16cm'],
      ['Túi Tote Da Phối Vải', 'tote', 'da', 420000, 9, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400', 'Túi tote phối da và vải độc đáo', '30x35x12cm'],
      ['Túi Đeo Chéo Hộp Vuông', 'crossbody', 'da', 320000, 11, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400', 'Túi đeo chéo hình hộp vuông trendy', '16x16x8cm'],
      ['Balo Nữ Mini Dạo Phố', 'backpack', 'vải', 380000, 18, 'https://images.unsplash.com/photo-1577733966973-d680bffd2e80?w=400', 'Balo mini xinh xắn cho nữ, gọn nhẹ dạo phố', '22x28x12cm'],
      ['Túi Tote Vải Canvas Trơn', 'tote', 'vải', 160000, 30, 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400', 'Túi tote canvas trơn basic, dễ phối đồ', '33x38x10cm']
    ];

    const insert = db.prepare('INSERT INTO Products (name, type, material, price, quantity, image_url, description, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    const insertMany = db.transaction((products) => {
      for (const product of products) insert.run(...product);
    });
    insertMany(products);
    console.log('✅ Đã thêm 12 sản phẩm mẫu');
  }

  console.log('✅ SQLite database đã sẵn sàng!');
}

// Khởi tạo database
initDatabase();

module.exports = { db };
