import {
  GET_DASHBOARD_OVERVIEW_DATA,
  HANDLE_SYNCED_FILE_FILTER,
} from "../actionTypes";
import { dashboardApis } from "../apis";

export const getDashboardOverviewData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_DASHBOARD_OVERVIEW_DATA,
    });
    const response = await dashboardApis.getDashboardOverviewData(params);
    dispatch({
      type: GET_DASHBOARD_OVERVIEW_DATA,
      payload: response,
    });
    console.log(response);
  } catch (error) {
    console.log(error);
  }
};

export const handleSyncedFilter = (params) => (dispatch) => {
  dispatch({
    type: HANDLE_SYNCED_FILE_FILTER,
    payload: params,
  });
};
