const {
  verifyDocuments,
  getDashboardData,
  getFolderOverviewData,
  getSubscriptionOverview,
  updateDocumentEffectiveDate,
  getFolderPath,
  getVerifyDocumentCount,
  viewFile,
  getAllOrganization,
  getOrgLocation,
  getProduct,
  getProductBatch,
  getBlockchainProof,
  getCoaBlockchainProof,
  autoPopulateMetadata,
} = require("../controllers/client");
const router = require("express").Router();

router.get("/overview-data", getDashboardData);
router.post("/get-folder-overview", getFolderOverviewData);
router.post("/verify-documents", verifyDocuments);
router.get("/get-subscription-overview", getSubscriptionOverview);
router.post("/update-document-effective-date", updateDocumentEffectiveDate);
router.get("/get-folder-path", getFolderPath);
router.get("/get-verify-document-counts", getVerifyDocumentCount);
router.get("/open-file", viewFile);
router.get("/get-organization-list", getAllOrganization);
router.post("/get-org-location-list", getOrgLocation);
router.post("/get-product-list", getProduct);
router.post("/get-product-batch-list", getProductBatch);
router.post("/blockchain-proof", getBlockchainProof);
router.post("/blockchain-proof-coa", getCoaBlockchainProof);
router.post("/auto-populate-metadata", autoPopulateMetadata);

module.exports = router;
