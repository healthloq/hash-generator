/**
 * SQLite-backed storage module.
 *
 * Provides:
 *   - getItem / setItem / removeItem  — drop-in replacement for node-localstorage
 *   - db (raw better-sqlite3 instance)  — used by services/healthMetrics.js
 */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const scratchDir = path.join(__dirname, "scratch");
if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });

const db = new Database(path.join(scratchDir, "data.db"));

// ── Core key-value store ───────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS store (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )
`);

// ── Processing log (powers the health dashboard) ───────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS processing_log (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path     TEXT    NOT NULL,
    file_name     TEXT    NOT NULL,
    hash          TEXT,
    status        TEXT    NOT NULL CHECK(status IN ('success','failed')),
    error_code    TEXT,
    error_message TEXT,
    processed_at  DATETIME NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_log_path   ON processing_log(file_path);
  CREATE INDEX IF NOT EXISTS idx_log_status ON processing_log(status);
  CREATE INDEX IF NOT EXISTS idx_log_ts     ON processing_log(processed_at);
`);

// ── One-time migration: seed processing_log from existing publisher data ───
const migrated = db.prepare("SELECT value FROM store WHERE key = ?").get("_migration_v1");
if (!migrated) {
  try {
    const raw = db.prepare("SELECT value FROM store WHERE key = ?").get("data");
    if (raw) {
      const records = Object.values(JSON.parse(raw.value));
      const insert = db.prepare(
        `INSERT OR IGNORE INTO processing_log (file_path, file_name, hash, status, processed_at)
         VALUES (?, ?, ?, 'success', ?)`
      );
      db.transaction((rows) => {
        for (const r of rows) {
          if (r.path && r.hash) {
            insert.run(
              r.path,
              r.fileName || path.basename(r.path),
              r.hash,
              r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString()
            );
          }
        }
      })(records);
    }
    db.prepare("INSERT OR REPLACE INTO store (key, value) VALUES (?, '1')").run("_migration_v1");
  } catch (_) {
    // Non-fatal — dashboard will just start empty
  }
}

// ── Prepared statements for the key-value interface ───────────────────────
const stmtGet    = db.prepare("SELECT value FROM store WHERE key = ?");
const stmtSet    = db.prepare("INSERT OR REPLACE INTO store (key, value) VALUES (?, ?)");
const stmtDelete = db.prepare("DELETE FROM store WHERE key = ?");

module.exports = {
  db,
  getItem(key)        { const row = stmtGet.get(key); return row ? row.value : null; },
  setItem(key, value) { stmtSet.run(key, value); },
  removeItem(key)     { stmtDelete.run(key); },
};
