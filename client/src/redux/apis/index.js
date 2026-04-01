import { get, post } from "../../Api";

export const API = {
  getDashboardOverviewData: async () => await get("/api/client/overview-data"),
  verifyDocuments: async (params) =>
    await post("/api/client/verify-documents", params),
  getFolderOverview: async (params, config) =>
    await post("/api/client/get-folder-overview", params, config),
  getSubscriptionOverview: async () =>
    await get("/api/client/get-subscription-overview"),
  updateDocumentEffectiveDate: async (params) =>
    await post("/api/client/update-document-effective-date", params),
  getFolderPath: async () => await get("/api/client/get-folder-path"),
  getVerifyDocumentCount: async (params) =>
    await get(`/api/client/get-verify-document-counts?path=${params?.path}`),
  getOrganizationList: async () =>
    await get(`/api/client/get-organization-list`),
  getOrganizationLocationList: async (params) =>
    await post(`/api/client/get-org-location-list`, params),
  getProductList: async (params) =>
    await post(`/api/client/get-product-list`, params),
  getProductBatchList: async (params) =>
    await post(`/api/client/get-product-batch-list`, params),
  // Blockchain proof calls proxied through backend to keep JWT server-side
  getDocumentHashBlockchainProof: async (params) =>
    await post("/api/client/blockchain-proof", params),
  getDocumentHashBlockChainProofNew: async (params) =>
    await post("/api/client/blockchain-proof-coa", params),
};
