const router = require("express").Router();
const ctrl = require("../controllers/health");

router.get("/status",       ctrl.getStatus);
router.get("/summary",      ctrl.getSummary);
router.get("/histogram",    ctrl.getHistogram);
router.get("/failed-files", ctrl.getFailedFiles);
router.post("/reprocess",   ctrl.reprocess);
router.post("/force-sync",  ctrl.forceSync);

module.exports = router;
