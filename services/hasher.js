/**
 * Pure hashing helpers — no side-effects, no external dependencies.
 */
const fs = require("fs");
const crypto = require("crypto");

const PDF_MAGIC = Buffer.from("%PDF");

// "Microsoft Print To PDF" (and similar drivers) embed the print timestamp in
// /CreationDate and /ModDate inside the PDF document-info dictionary.  Only
// those bytes differ across multiple prints of an identical document, so we
// zero them out before hashing to produce a stable fingerprint.
// Handles both literal-string form  /CreationDate (D:20240811...)
// and hex-string form               /CreationDate <443A323032...>
const PDF_DATE_LITERAL_RE = /\/(CreationDate|ModDate)\s*\(([^)]*)\)/g;
const PDF_DATE_HEX_RE     = /\/(CreationDate|ModDate)\s*<([0-9a-fA-F]*)>/g;

function stripPdfTimestamps(buffer) {
  if (buffer.length < 4 || !buffer.slice(0, 4).equals(PDF_MAGIC)) {
    return buffer;
  }

  // "binary" encoding round-trips every byte value through a JS string unchanged.
  let content = buffer.toString("binary");

  content = content.replace(PDF_DATE_LITERAL_RE, (_match, key, dateVal) =>
    `/${key} (${ "\x00".repeat(dateVal.length) })`
  );

  content = content.replace(PDF_DATE_HEX_RE, (_match, key, hexVal) =>
    `/${key} <${ "0".repeat(hexVal.length) }>`
  );

  return Buffer.from(content, "binary");
}

/**
 * Compute the SHA-256 hex digest of a file at the given path.
 * For PDF files, /CreationDate and /ModDate values are zeroed out first so
 * that print-driver timestamps do not affect the hash.
 * Throws if the file cannot be read.
 */
function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const normalized = stripPdfTimestamps(buffer);
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

module.exports = { hashFile };
