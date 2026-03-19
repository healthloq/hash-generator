const router = require("express").Router();
const ctrl = require("../controllers/health");

router.get("/status",          ctrl.getStatus);
router.get("/summary",         ctrl.getSummary);
router.get("/histogram",       ctrl.getHistogram);
router.get("/failed-files",    ctrl.getFailedFiles);
router.post("/reprocess",      ctrl.reprocess);
router.post("/force-sync",     ctrl.forceSync);
router.post("/service/start",  ctrl.serviceStart);
router.post("/service/stop",   ctrl.serviceStop);
router.post("/service/restart",        ctrl.serviceRestart);
router.get("/metadata-cache",                  ctrl.getMetadataCache);
router.get("/metadata-cache/:entityType",      ctrl.getMetadataCacheEntries);
router.post("/metadata-cache/refresh",         ctrl.refreshMetadataCache);

module.exports = router;
