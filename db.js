/**
 * SQLite-backed drop-in replacement for node-localstorage.
 * Provides the same getItem / setItem / removeItem interface so no other
 * code needs to change, but uses a proper ACID database instead of
 * serialising giant JSON blobs to individual flat files.
 */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const scratchDir = path.join(__dirname, "scratch");
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

const db = new Database(path.join(scratchDir, "data.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

const stmtGet    = db.prepare("SELECT value FROM store WHERE key = ?");
const stmtSet    = db.prepare("INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)");
const stmtDelete = db.prepare("DELETE FROM store WHERE key = ?");

module.exports = {
  getItem(key) {
    const row = stmtGet.get(key);
    return row ? row.value : null;
  },
  setItem(key, value) {
    stmtSet.run(key, value);
  },
  removeItem(key) {
    stmtDelete.run(key);
  },
};
