const {
  renderHomePage,
  verifyDocuments,
  getDashboardData,
  getFolderOverviewData,
} = require("../controllers/dashboard");
const router = require("express").Router();

router.get("/", renderHomePage);
router.get("/dashboard/overview-data", getDashboardData);
router.post("/dashboard/get-folder-overview", getFolderOverviewData);
router.post("/dashboard/verify-documents", verifyDocuments);

module.exports = router;
