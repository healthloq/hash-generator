/**
 * Recursive directory scanner.
 * Walks a directory tree, filters by allowed MIME types, and yields file entries.
 * All hashing and business logic is kept out of this module.
 */
const fs = require("fs");
const path = require("path");
const mime = require("mime-types");
const { ALLOWED_DOCUMENT_FILE_MIME_TYPES } = require("../constants");
const logger = require("../logger");

/**
 * Return the MIME type for a file path using the mime-types library.
 * Returns null if the file does not exist or the type cannot be determined.
 */
function getMimeType(filePath) {
  if (!fs.existsSync(filePath)) {
    logger.warn({ filePath }, "getMimeType: file does not exist");
    return null;
  }
  return mime.lookup(filePath) || null;
}

/**
 * Iterate all allowed files under rootFolderPath.
 *
 * Yields objects: { filePath, name, mimeType }
 * Unreadable directories are collected in the returned { unreadFolders } list.
 *
 * @param {string} rootFolderPath
 * @returns {{ files: AsyncGenerator, unreadFolders: string[] }}
 */
async function* scanDirectory(rootFolderPath) {
  const unreadFolders = [];
  const queue = [rootFolderPath];

  while (queue.length > 0) {
    const folderPath = queue.pop();
    let dir;

    try {
      dir = fs.opendirSync(folderPath);
    } catch (err) {
      unreadFolders.push(folderPath);
      logger.warn({ folderPath, err }, "scanDirectory: cannot open directory");
      continue;
    }

    for await (const entry of dir) {
      if (entry.isDirectory()) {
        queue.push(path.join(folderPath, entry.name));
        continue;
      }
      if (!entry.isFile()) continue;

      const filePath = path.join(folderPath, entry.name);
      const mimeType = getMimeType(filePath);
      if (!ALLOWED_DOCUMENT_FILE_MIME_TYPES.includes(mimeType)) continue;

      yield { filePath, name: entry.name, mimeType, _unreadFolders: unreadFolders };
    }
  }
}

module.exports = { scanDirectory, getMimeType };
