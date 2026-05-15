// Kết nối Database
// - Ưu tiên SQL Server (mssql)
// - Tự fallback sang SQLite (better-sqlite3) nếu SQL Server không khả dụng
const sql = require("mssql");

// Cấu hình kết nối SQL Server (có thể override bằng ENV nếu cần)
function getSqlServerConfig() {
  return {
    server: process.env.DB_SERVER || "localhost\\SQLEXPRESS",
    database: process.env.DB_DATABASE || "HandbagShopDB",
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "123",
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

// Driver mode:
// - DB_DRIVER=mssql|sqlite|auto (default: auto)
let driver = (process.env.DB_DRIVER || "auto").toLowerCase();

// Cache pools
let mssqlPool;
let sqlitePool;

function normalizeSqlForSqlite(sqlText) {
  let text = sqlText;

  // SQL Server -> SQLite small compat transforms
  text = text.replace(/\bGETDATE\(\)/gi, "CURRENT_TIMESTAMP");
  text = text.replace(/\bN'([^']*)'/g, "'$1'");

  // LIKE '%' + @param + '%'  -> LIKE '%' || @param || '%'
  text = text.replace(
    /LIKE\s*'%'\s*\+\s*(@\w+)\s*\+\s*'%'/gi,
    "LIKE '%' || $1 || '%'",
  );

  // OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY -> LIMIT @limit OFFSET @offset
  text = text.replace(
    /OFFSET\s+(@\w+)\s+ROWS\s+FETCH\s+NEXT\s+(@\w+)\s+ROWS\s+ONLY/gi,
    "LIMIT $2 OFFSET $1",
  );

  return text;
}

function parseInsertOutput(sqlText) {
  // Support patterns like:
  // INSERT INTO Table (..) OUTPUT INSERTED.* VALUES (...)
  // INSERT INTO Table (..) OUTPUT INSERTED.id, INSERTED.username VALUES (...)
  const insertMatch = /INSERT\s+INTO\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/i.exec(
    sqlText,
  );
  const outputMatch = /\bOUTPUT\s+INSERTED\.([\s\S]*?)\bVALUES\b/i.exec(
    sqlText,
  );
  if (!insertMatch || !outputMatch) return null;

  const tableName = insertMatch[1];
  const outputRaw = outputMatch[1].trim();
  const outputColumns =
    outputRaw === "*"
      ? ["*"]
      : outputRaw
          .split(",")
          .map((s) => s.trim())
          .map((s) => s.replace(/^INSERTED\./i, ""))
          .filter(Boolean);

  // Remove OUTPUT ... part
  const withoutOutput = sqlText.replace(
    /\bOUTPUT\s+INSERTED\.[\s\S]*?\bVALUES\b/i,
    "VALUES",
  );

  return { tableName, outputColumns, sqlText: withoutOutput };
}

class SqliteRequest {
  constructor(db) {
    this.db = db;
    this.params = {};
  }

  input(name, _type, value) {
    this.params[name] = value;
    return this;
  }

  async query(sqlText) {
    const parsed = parseInsertOutput(sqlText);
    const normalized = normalizeSqlForSqlite(parsed ? parsed.sqlText : sqlText);
    const trimmed = normalized.trim();
    const isSelect = /^SELECT\b/i.test(trimmed);
    const isInsert = /^INSERT\b/i.test(trimmed);
    const isUpdate = /^UPDATE\b/i.test(trimmed);
    const isDelete = /^DELETE\b/i.test(trimmed);

    try {
      if (isSelect) {
        const stmt = this.db.prepare(trimmed);
        const rows = stmt.all(this.params);
        return { recordset: rows, rowsAffected: [rows.length] };
      }

      if (isInsert) {
        const stmt = this.db.prepare(trimmed);
        const info = stmt.run(this.params);

        if (parsed) {
          const lastId = Number(info.lastInsertRowid);
          const cols = parsed.outputColumns;
          const selectCols =
            cols.length === 1 && cols[0] === "*" ? "*" : cols.join(", ");
          const selectStmt = this.db.prepare(
            `SELECT ${selectCols} FROM ${parsed.tableName} WHERE id = @__id`,
          );
          const row = selectStmt.get({ ...this.params, __id: lastId });
          return { recordset: row ? [row] : [], rowsAffected: [info.changes] };
        }

        return { recordset: [], rowsAffected: [info.changes] };
      }

      if (isUpdate || isDelete) {
        const stmt = this.db.prepare(trimmed);
        const info = stmt.run(this.params);
        return { recordset: [], rowsAffected: [info.changes] };
      }

      // Fallback: try exec (supports DDL)
      this.db.exec(trimmed);
      return { recordset: [], rowsAffected: [0] };
    } catch (err) {
      err.query = trimmed;
      err.params = this.params;
      throw err;
    }
  }
}

class SqliteTransaction {
  constructor(db) {
    this.db = db;
  }

  async begin() {
    this.db.exec("BEGIN");
  }

  request() {
    return new SqliteRequest(this.db);
  }

  async commit() {
    this.db.exec("COMMIT");
  }

  async rollback() {
    this.db.exec("ROLLBACK");
  }
}

function getSqlitePool() {
  if (!sqlitePool) {
    const { db } = require("./db-sqlite");
    sqlitePool = {
      request: () => new SqliteRequest(db),
      transaction: () => new SqliteTransaction(db),
    };
    console.log("🪶 Đang dùng SQLite (fallback)");
  }
  return sqlitePool;
}

async function getMssqlPool() {
  if (!mssqlPool) {
    const config = getSqlServerConfig();
    mssqlPool = await sql.connect(config);
    console.log("✅ Kết nối SQL Server thành công!");
  }
  return mssqlPool;
}

async function getConnection() {
  if (driver === "sqlite") return getSqlitePool();
  if (driver === "mssql") return getMssqlPool();

  // auto
  try {
    const pool = await getMssqlPool();
    driver = "mssql";
    return pool;
  } catch (err) {
    console.warn(
      "⚠️ Không thể kết nối SQL Server, chuyển sang SQLite fallback.",
    );
    console.warn(err?.message || err);
    driver = "sqlite";
    return getSqlitePool();
  }
}

// Hàm query (tương thích giữ nguyên API cũ)
async function query(sqlQuery, params = []) {
  const pool = await getConnection();
  const request = pool.request();
  params.forEach((param, index) =>
    request.input(`param${index}`, undefined, param),
  );
  return request.query(sqlQuery);
}

// Đóng connection
async function closeConnection() {
  try {
    if (mssqlPool) {
      await mssqlPool.close();
      mssqlPool = null;
      console.log("Đã đóng kết nối SQL Server");
    }
  } catch (err) {
    console.error("Lỗi đóng kết nối:", err);
  }
}

module.exports = {
  sql,
  getConnection,
  query,
  closeConnection,
};
