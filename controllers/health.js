const {
  getSummary,
  getHistogram,
  getFailedFiles,
  clearCacheForFiles,
} = require("../services/healthMetrics");
const { getSyncData } = require("../utils");
const logger = require("../logger");

exports.getSummary = (req, res) => {
  try {
    res.json({ status: "1", data: getSummary() });
  } catch (err) {
    logger.error({ err }, "health/getSummary failed");
    res.status(500).json({ status: "0", message: err.message });
  }
};

exports.getHistogram = (req, res) => {
  try {
    const groupBy = ["day", "week", "month", "year"].includes(req.query.groupBy)
      ? req.query.groupBy
      : "day";
    res.json({ status: "1", data: getHistogram(groupBy) });
  } catch (err) {
    logger.error({ err }, "health/getHistogram failed");
    res.status(500).json({ status: "0", message: err.message });
  }
};

exports.getFailedFiles = (req, res) => {
  try {
    res.json({ status: "1", data: getFailedFiles() });
  } catch (err) {
    logger.error({ err }, "health/getFailedFiles failed");
    res.status(500).json({ status: "0", message: err.message });
  }
};

exports.reprocess = (req, res) => {
  try {
    const { filePaths } = req.body;
    if (!Array.isArray(filePaths) || !filePaths.length) {
      return res.status(400).json({ status: "0", message: "filePaths array is required" });
    }
    clearCacheForFiles(filePaths);
    // Trigger an immediate sync if one isn't already running
    if (!global.isGetSyncDataProcessStart) {
      getSyncData();
    }
    res.json({
      status: "1",
      message: `Reprocessing started for ${filePaths.length} file(s)`,
    });
  } catch (err) {
    logger.error({ err }, "health/reprocess failed");
    res.status(500).json({ status: "0", message: err.message });
  }
};

exports.forceSync = (req, res) => {
  try {
    if (global.isGetSyncDataProcessStart) {
      return res.json({ status: "1", message: "Sync already in progress" });
    }
    getSyncData();
    res.json({ status: "1", message: "Sync started" });
  } catch (err) {
    logger.error({ err }, "health/forceSync failed");
    res.status(500).json({ status: "0", message: err.message });
  }
};

exports.getStatus = (req, res) => {
  try {
    const staticData = (() => {
      try { return JSON.parse(global.localStorage.getItem("staticData") || "{}"); }
      catch { return {}; }
    })();
    res.json({
      status: "ok",
      version: require("../package.json").version,
      lastSyncedDate: staticData?.lastSyncedDate || null,
      syncRunning: global.isGetSyncDataProcessStart || false,
      verifierRunning: global.isVerifierScriptRunning || false,
      subscriptionTypes: (global.subscriptionDetail || []).map((s) => s.subscription_type),
      rootFolderPath: process.env.ROOT_FOLDER_PATH || null,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
