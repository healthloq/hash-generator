import {
  GET_DASHBOARD_OVERVIEW_DATA,
  GET_FOLDER_OVERVIEW,
  GET_ORGANIZATION_LIST,
  HANDLE_SYNCED_FILE_FILTER,
  HANDLE_VERIFY_DOCUMENTS,
  SET_INITIALSTATE,
  SOCKET_DOCUMENT_VERIFICATION_PROGRESS,
} from "../actionTypes";
import { API } from "../apis";

export const getDashboardOverviewData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_DASHBOARD_OVERVIEW_DATA,
    });
    const response = await API.getDashboardOverviewData(params);
    dispatch({
      type: GET_DASHBOARD_OVERVIEW_DATA,
      payload: response,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getOrganizationList = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_ORGANIZATION_LIST,
      payload: {
        isLoading: true,
      },
    });
    const response = await API.getOrganizationList(params);
    dispatch({
      type: GET_ORGANIZATION_LIST,
      payload: { data: response, isLoading: false },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_ORGANIZATION_LIST,
      payload: {
        isLoading: false,
      },
    });
  }
};

export const handleDocumentVerification = (params) => async (dispatch) => {
  try {
    dispatch({
      type: HANDLE_VERIFY_DOCUMENTS,
    });
    dispatch({
      type: SOCKET_DOCUMENT_VERIFICATION_PROGRESS,
      payload: {
        verificationCompletedCount: 0,
        verificationType: "",
        fileName: "",
        filePath: "",
      },
    });
    const response = await API.verifyDocuments(params);
    dispatch({
      type: HANDLE_VERIFY_DOCUMENTS,
      payload: response,
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: HANDLE_VERIFY_DOCUMENTS,
    });
  }
};

export const getFolderOverview = (params, config) => async (dispatch) => {
  try {
    dispatch({
      type: GET_FOLDER_OVERVIEW,
      payload: {
        isLoading: true,
      },
    });
    const response = await API.getFolderOverview(params, config);
    dispatch({
      type: GET_FOLDER_OVERVIEW,
      payload: { ...response, ...response?.data, isLoading: false },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_ORGANIZATION_LIST,
      payload: {
        isLoading: false,
      },
    });
  }
};

export const handleSyncedFilter = (params) => (dispatch) => {
  dispatch({
    type: HANDLE_SYNCED_FILE_FILTER,
    payload: params,
  });
};

export const setInitialState = (params) => (dispatch) => {
  dispatch({
    type: SET_INITIALSTATE,
    payload: params,
  });
};
