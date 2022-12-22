const {
  verifyDocuments,
  getDashboardData,
  getFolderOverviewData,
  getSubscriptionOverview,
} = require("../controllers/client");
const router = require("express").Router();

router.get("/overview-data", getDashboardData);
router.post("/get-folder-overview", getFolderOverviewData);
router.post("/verify-documents", verifyDocuments);
router.get("/get-subscription-overview", getSubscriptionOverview);

module.exports = router;
