const {
  verifyDocuments,
  getDashboardData,
  getFolderOverviewData,
  getSubscriptionOverview,
  updateDocumentEffectiveDate,
} = require("../controllers/client");
const router = require("express").Router();

router.get("/overview-data", getDashboardData);
router.post("/get-folder-overview", getFolderOverviewData);
router.post("/verify-documents", verifyDocuments);
router.get("/get-subscription-overview", getSubscriptionOverview);
router.post("/update-document-effective-date", updateDocumentEffectiveDate);

module.exports = router;
