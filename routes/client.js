const {
  verifyDocuments,
  getDashboardData,
  getFolderOverviewData,
  getSubscriptionOverview,
  updateDocumentEffectiveDate,
  getFolderPath,
} = require("../controllers/client");
const router = require("express").Router();

router.get("/overview-data", getDashboardData);
router.post("/get-folder-overview", getFolderOverviewData);
router.post("/verify-documents", verifyDocuments);
router.get("/get-subscription-overview", getSubscriptionOverview);
router.post("/update-document-effective-date", updateDocumentEffectiveDate);
router.get("/get-folder-path", getFolderPath);

module.exports = router;
