// Script kiểm tra kết nối SQL Server
const sql = require('mssql');

console.log('🔍 Đang kiểm tra các phương thức kết nối SQL Server...\n');

// Phương thức 1: Windows Authentication
async function testWindowsAuth() {
  console.log('1️⃣ Thử Windows Authentication...');
  const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'master',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Windows Authentication thành công!');
    await pool.close();
    return true;
  } catch (err) {
    console.log('❌ Windows Authentication thất bại:', err.message);
    return false;
  }
}

// Phương thức 2: SQL Server Authentication với sa
async function testSQLAuth() {
  console.log('\n2️⃣ Thử SQL Server Authentication (sa)...');
  const config = {
    server: 'localhost\\SQLEXPRESS',
    database: 'master',
    user: 'sa',
    password: '123', // Password thật
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ SQL Server Authentication thành công với sa!');
    await pool.close();
    return true;
  } catch (err) {
    console.log('❌ SQL Server Authentication thất bại:', err.message);
    return false;
  }
}

// Phương thức 3: Localhost không có instance
async function testLocalhost() {
  console.log('\n3️⃣ Thử kết nối localhost (không có \\SQLEXPRESS)...');
  const config = {
    server: 'localhost',
    database: 'master',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true
    }
  };
  
  try {
    const pool = await sql.connect(config);
    console.log('✅ Kết nối localhost thành công!');
    await pool.close();
    return true;
  } catch (err) {
    console.log('❌ Kết nối localhost thất bại:', err.message);
    return false;
  }
}

// Chạy tất cả các test
async function runTests() {
  let success = false;
  
  success = await testWindowsAuth();
  if (success) {
    console.log('\n✨ Nên dùng Windows Authentication');
    console.log('👉 Cấu hình: server: "localhost\\\\SQLEXPRESS", không cần user/password');
    return;
  }
  
  success = await testSQLAuth();
  if (success) {
    console.log('\n✨ Nên dùng SQL Server Authentication');
    console.log('👉 Cấu hình: server: "localhost\\\\SQLEXPRESS", user: "sa", password: ""');
    return;
  }
  
  success = await testLocalhost();
  if (success) {
    console.log('\n✨ Nên dùng localhost');
    console.log('👉 Cấu hình: server: "localhost", không cần user/password');
    return;
  }
  
  console.log('\n⚠️ Không thể kết nối SQL Server bằng bất kỳ phương thức nào!');
  console.log('\n📝 Hướng dẫn khắc phục:');
  console.log('1. Kiểm tra SQL Server đã được cài đặt và đang chạy');
  console.log('2. Mở SQL Server Configuration Manager');
  console.log('3. Bật TCP/IP protocol cho SQL Server');
  console.log('4. Khởi động lại SQL Server service');
  console.log('5. Nếu dùng SQL Server Authentication:');
  console.log('   - Bật "SQL Server and Windows Authentication mode" trong SQL Server');
  console.log('   - Tạo hoặc kích hoạt tài khoản sa');
  console.log('   - Đặt password cho sa');
}

runTests().catch(console.error);
