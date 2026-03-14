const Database = require("better-sqlite3")

const db = new Database("./hash-dashboard.db")

db.exec(`
CREATE TABLE IF NOT EXISTS stats (
 id INTEGER PRIMARY KEY,
 total_hashed INTEGER DEFAULT 0,
 total_errors INTEGER DEFAULT 0
)
`)

function recordHashes(count){

 db.prepare(`
 INSERT INTO stats(id,total_hashed)
 VALUES (1,?)
 ON CONFLICT(id)
 DO UPDATE SET total_hashed = total_hashed + ?
 `).run(count,count)

}

function recordError(){

 db.prepare(`
 INSERT INTO stats(id,total_errors)
 VALUES (1,1)
 ON CONFLICT(id)
 DO UPDATE SET total_errors = total_errors + 1
 `).run()

}

function getStats(){

 return db.prepare(`
 SELECT * FROM stats WHERE id=1
 `).get()

}

module.exports = {
 recordHashes,
 recordError,
 getStats
}