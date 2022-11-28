import { post, get } from "../../Api";

export const dashboardApis = {
  getDashboardOverviewData: async () => await get("/dashboard/overview-data"),
};
