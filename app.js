// Node.js Backend Server cho Website Bán Túi Xách
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { sql, getConnection } = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Serve admin page
app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin.js", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.js"));
});

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// ==================== API PRODUCTS ====================

// Lấy danh sách sản phẩm với filter và pagination
app.get("/api/products", async (req, res) => {
  try {
    const {
      search,
      type,
      material,
      minPrice,
      maxPrice,
      page = 1,
      limit = 12,
    } = req.query;
    const pool = await getConnection();

    let whereConditions = [];
    const request = pool.request();

    if (search) {
      whereConditions.push(`name LIKE '%' + @search + '%'`);
      request.input("search", sql.NVarChar, search);
    }

    if (type) {
      whereConditions.push("type = @type");
      request.input("type", sql.NVarChar, type);
    }

    if (material) {
      whereConditions.push("material = @material");
      request.input("material", sql.NVarChar, material);
    }

    if (minPrice) {
      whereConditions.push("price >= @minPrice");
      request.input("minPrice", sql.Decimal(10, 2), parseFloat(minPrice));
    }

    if (maxPrice) {
      whereConditions.push("price <= @maxPrice");
      request.input("maxPrice", sql.Decimal(10, 2), parseFloat(maxPrice));
    }

    const whereClause =
      whereConditions.length > 0
        ? "WHERE " + whereConditions.join(" AND ")
        : "";

    // Đếm tổng số sản phẩm
    const countQuery = `SELECT COUNT(*) as total FROM Products ${whereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Lấy sản phẩm với pagination
    const offset = (page - 1) * limit;
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, parseInt(limit));

    const dataQuery = `
      SELECT * FROM Products 
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const dataResult = await request.query(dataQuery);

    res.json({
      success: true,
      data: dataResult.recordset,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Lỗi lấy danh sách sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Lấy chi tiết sản phẩm
app.get("/api/products/:id", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Products WHERE id = @id");

    if (result.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Lỗi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Thêm sản phẩm mới (Admin)
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      type,
      material,
      price,
      quantity,
      image_url,
      description,
      size,
    } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .input("material", sql.NVarChar, material)
      .input("price", sql.Decimal(10, 2), price)
      .input("quantity", sql.Int, quantity)
      .input("image_url", sql.NVarChar, image_url)
      .input("description", sql.NVarChar, description)
      .input("size", sql.NVarChar, size).query(`
        INSERT INTO Products (name, type, material, price, quantity, image_url, description, size)
        OUTPUT INSERTED.*
        VALUES (@name, @type, @material, @price, @quantity, @image_url, @description, @size)
      `);

    res.json({ success: true, data: result.recordset[0] });
  } catch (err) {
    console.error("Lỗi thêm sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Cập nhật sản phẩm (Admin)
app.put("/api/products/:id", async (req, res) => {
  try {
    const {
      name,
      type,
      material,
      price,
      quantity,
      image_url,
      description,
      size,
    } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.NVarChar, name)
      .input("type", sql.NVarChar, type)
      .input("material", sql.NVarChar, material)
      .input("price", sql.Decimal(10, 2), price)
      .input("quantity", sql.Int, quantity)
      .input("image_url", sql.NVarChar, image_url)
      .input("description", sql.NVarChar, description)
      .input("size", sql.NVarChar, size).query(`
        UPDATE Products 
        SET name = @name, type = @type, material = @material, price = @price, 
            quantity = @quantity, image_url = @image_url, description = @description,
            size = @size, updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, message: "Cập nhật sản phẩm thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Xóa sản phẩm (Admin)
app.delete("/api/products/:id", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Products WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy sản phẩm" });
    }

    res.json({ success: true, message: "Xóa sản phẩm thành công" });
  } catch (err) {
    console.error("Lỗi xóa sản phẩm:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Upload ảnh sản phẩm
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Không có file được upload" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Lỗi upload ảnh:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ==================== API ORDERS ====================

// Tạo đơn hàng mới
app.post("/api/orders", async (req, res) => {
  try {
    const { customer_name, phone, address, items, total_amount, notes } =
      req.body;

    const pool = await getConnection();
    const transaction = pool.transaction();

    await transaction.begin();

    try {
      // Tạo đơn hàng
      const orderResult = await transaction
        .request()
        .input("customer_name", sql.NVarChar, customer_name)
        .input("phone", sql.NVarChar, phone)
        .input("address", sql.NVarChar, address)
        .input("total_amount", sql.Decimal(10, 2), total_amount)
        .input("final_amount", sql.Decimal(10, 2), total_amount)
        .input("notes", sql.NVarChar, notes || "").query(`
          INSERT INTO Orders (customer_name, phone, address, total_amount, final_amount, notes)
          OUTPUT INSERTED.id
          VALUES (@customer_name, @phone, @address, @total_amount, @final_amount, @notes)
        `);

      const orderId = orderResult.recordset[0].id;

      // Thêm chi tiết đơn hàng và cập nhật số lượng sản phẩm
      for (const item of items) {
        await transaction
          .request()
          .input("order_id", sql.Int, orderId)
          .input("product_id", sql.Int, item.product_id)
          .input("product_name", sql.NVarChar, item.product_name)
          .input("quantity", sql.Int, item.quantity)
          .input("price", sql.Decimal(10, 2), item.price).query(`
            INSERT INTO OrderItems (order_id, product_id, product_name, quantity, price)
            VALUES (@order_id, @product_id, @product_name, @quantity, @price)
          `);

        // Giảm số lượng sản phẩm trong kho
        await transaction
          .request()
          .input("product_id", sql.Int, item.product_id)
          .input("quantity", sql.Int, item.quantity)
          .query(
            "UPDATE Products SET quantity = quantity - @quantity WHERE id = @product_id",
          );
      }

      await transaction.commit();

      res.json({
        success: true,
        message: "Đặt hàng thành công",
        orderId,
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Lỗi tạo đơn hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Lấy danh sách đơn hàng (Admin)
app.get("/api/orders", async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const pool = await getConnection();
    const request = pool.request();

    let whereClause = "";
    if (status) {
      whereClause = "WHERE status = @status";
      request.input("status", sql.NVarChar, status);
    }

    // Đếm tổng số đơn hàng
    const countQuery = `SELECT COUNT(*) as total FROM Orders ${whereClause}`;
    const countResult = await request.query(countQuery);
    const total = countResult.recordset[0].total;

    // Lấy danh sách đơn hàng
    const offset = (page - 1) * limit;
    request.input("offset", sql.Int, offset);
    request.input("limit", sql.Int, parseInt(limit));

    const dataQuery = `
      SELECT * FROM Orders 
      ${whereClause}
      ORDER BY created_at DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;

    const dataResult = await request.query(dataQuery);

    res.json({
      success: true,
      data: dataResult.recordset,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Lỗi lấy danh sách đơn hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Lấy chi tiết đơn hàng
app.get("/api/orders/:id", async (req, res) => {
  try {
    const pool = await getConnection();

    // Lấy thông tin đơn hàng
    const orderResult = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT * FROM Orders WHERE id = @id");

    if (orderResult.recordset.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    // Lấy chi tiết sản phẩm trong đơn hàng
    const itemsResult = await pool
      .request()
      .input("order_id", sql.Int, req.params.id)
      .query("SELECT * FROM OrderItems WHERE order_id = @order_id");

    const order = orderResult.recordset[0];
    order.items = itemsResult.recordset;

    res.json({ success: true, data: order });
  } catch (err) {
    console.error("Lỗi lấy chi tiết đơn hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Cập nhật trạng thái đơn hàng (Admin)
app.put("/api/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("status", sql.NVarChar, status).query(`
        UPDATE Orders 
        SET status = @status, updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, message: "Cập nhật trạng thái thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Xóa đơn hàng (Admin)
app.delete("/api/orders/:id", async (req, res) => {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("DELETE FROM Orders WHERE id = @id");

    if (result.rowsAffected[0] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy đơn hàng" });
    }

    res.json({ success: true, message: "Xóa đơn hàng thành công" });
  } catch (err) {
    console.error("Lỗi xóa đơn hàng:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// ==================== API USERS ====================

// Đăng ký người dùng
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, password, fullname, email, phone, address } = req.body;

    const pool = await getConnection();

    // Kiểm tra username đã tồn tại chưa
    const checkUser = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT id FROM Users WHERE username = @username");

    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ error: "Tên đăng nhập đã tồn tại" });
    }

    // Thêm user mới
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.NVarChar, email || null)
      .input("phone", sql.NVarChar, phone || null)
      .input("address", sql.NVarChar, address || null).query(`
        INSERT INTO Users (username, password, fullname, email, phone, address)
        OUTPUT INSERTED.id, INSERTED.username, INSERTED.fullname, INSERTED.email
        VALUES (@username, @password, @fullname, @email, @phone, @address)
      `);

    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      token: token,
      message: "Đăng ký thành công",
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi đăng ký:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Đăng nhập người dùng
app.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query(
        "SELECT id, username, fullname, email, phone, address FROM Users WHERE username = @username AND password = @password",
      );

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      token: token,
      message: "Đăng nhập thành công",
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Lấy thông tin người dùng
app.get("/api/users/profile", async (req, res) => {
  try {
    const userId = req.query.userId;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("userId", sql.Int, userId)
      .query(
        "SELECT id, username, fullname, email, phone, address FROM Users WHERE id = @userId",
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.json({
      success: true,
      user: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi lấy thông tin:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Cập nhật thông tin người dùng
app.put("/api/users/profile", async (req, res) => {
  try {
    const { userId, fullname, email, phone, address } = req.body;

    const pool = await getConnection();
    await pool
      .request()
      .input("userId", sql.Int, userId)
      .input("fullname", sql.NVarChar, fullname)
      .input("email", sql.NVarChar, email)
      .input("phone", sql.NVarChar, phone)
      .input("address", sql.NVarChar, address).query(`
        UPDATE Users 
        SET fullname = @fullname, email = @email, phone = @phone, address = @address, updated_at = GETDATE()
        WHERE id = @userId
      `);

    res.json({ success: true, message: "Cập nhật thông tin thành công" });
  } catch (err) {
    console.error("Lỗi cập nhật thông tin:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// ==================== API ADMIN ====================

// Đăng nhập admin
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const pool = await getConnection();
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .input("password", sql.NVarChar, password)
      .query(
        "SELECT id, username, fullname FROM Admins WHERE username = @username AND password = @password",
      );

    if (result.recordset.length === 0) {
      return res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // Tạo token đơn giản (trong thực tế nên dùng JWT)
    const token = Buffer.from(`${username}:${Date.now()}`).toString("base64");

    res.json({
      success: true,
      token: token,
      message: "Đăng nhập thành công",
      admin: result.recordset[0],
    });
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// Thống kê tổng quan (Admin)
app.get("/api/admin/stats", async (req, res) => {
  try {
    const pool = await getConnection();

    // Tổng số sản phẩm
    const productsCount = await pool
      .request()
      .query("SELECT COUNT(*) as total FROM Products");

    // Tổng số đơn hàng
    const ordersCount = await pool
      .request()
      .query("SELECT COUNT(*) as total FROM Orders");

    // Đơn hàng chờ xác nhận
    const pendingOrders = await pool
      .request()
      .query(
        "SELECT COUNT(*) as total FROM Orders WHERE status = N'Chờ xác nhận'",
      );

    // Tổng doanh thu
    const revenue = await pool
      .request()
      .query(
        "SELECT SUM(total_amount) as total FROM Orders WHERE status != N'Đã hủy'",
      );

    res.json({
      success: true,
      stats: {
        totalProducts: productsCount.recordset[0].total,
        totalOrders: ordersCount.recordset[0].total,
        pendingOrders: pendingOrders.recordset[0].total,
        totalRevenue: revenue.recordset[0].total || 0,
      },
    });
  } catch (err) {
    console.error("Lỗi lấy thống kê:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📁 Thư mục public: ${path.join(__dirname, "public")}`);
  console.log(`📁 Thư mục uploads: ${path.join(__dirname, "uploads")}`);
});

// Xử lý khi tắt server
process.on("SIGINT", async () => {
  const { closeConnection } = require("./db");
  await closeConnection();
  process.exit(0);
});
