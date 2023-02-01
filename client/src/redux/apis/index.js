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
};
