/**
 * Pure hashing helpers — no side-effects, no external dependencies.
 */
const fs = require("fs");
const crypto = require("crypto");

/**
 * Compute the SHA-256 hex digest of a file at the given path.
 * Throws if the file cannot be read.
 */
function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

module.exports = { hashFile };
