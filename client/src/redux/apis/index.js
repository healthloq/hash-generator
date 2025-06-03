import { get, post, healthloqGet, healthloqPost } from "../../Api";

export const API = {
  getDashboardOverviewData: async () => await get("/api/client/overview-data"),
  verifyDocuments: async (params) =>
    await post("/api/client/verify-documents", params),
  getFolderOverview: async (params, config) =>
    await post("/api/client/get-folder-overview", params, config),
  getOrganizationList: async () =>
    await healthloqGet("/document-hash/organization-list"),
  getSubscriptionOverview: async () =>
    await get("/api/client/get-subscription-overview"),
  getDocumentHashBlockchainProof: async (params) =>
    await healthloqPost("/client-app/verify", params),
  updateDocumentEffectiveDate: async (params) =>
    await post("/api/client/update-document-effective-date", params),
  getFolderPath: async () => await get("/api/client/get-folder-path"),
  getVerifyDocumentCount: async (params) => {
    return await get(
      `/api/client/get-verify-document-counts?path=${params?.path}`
    );
  },
  getDocumentHashBlockChainProofNew: async (params) =>
    await healthloqPost("/client-app/verify-coa-document-doc-tool", params),
  getOrganizationList: async (params) => {
    return await get(`/api/client/get-organization-list`);
  },
  getOrganizationLocationList: async (params) => {
    console.log(params);
    return await post(`/api/client/get-org-location-list`, params);
  },
  getProductList: async (params) => {
    return await post(`/api/client/get-product-list`, params);
  },
  getProductBatchList: async (params) => {
    return await post(`/api/client/get-product-batch-list`, params);
  },
};
