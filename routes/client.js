const {
  verifyDocuments,
  getDashboardData,
  getFolderOverviewData,
} = require("../controllers/client");
const router = require("express").Router();

router.get("/overview-data", getDashboardData);
router.post("/get-folder-overview", getFolderOverviewData);
router.post("/verify-documents", verifyDocuments);

module.exports = router;
