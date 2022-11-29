import { get, healthloqPost, post } from "../../Api";

export const API = {
  getDashboardOverviewData: async () => await get("/api/client/overview-data"),
  verifyDocuments: async (params) =>
    await post("/api/client/verify-documents", params),
  getFolderOverview: async (params, config) =>
    await post("/api/client/get-folder-overview", params, config),
  getOrganizationList: async () =>
    await healthloqPost("/client-app/organization-list"),
};
