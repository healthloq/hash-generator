import {
  GET_DASHBOARD_OVERVIEW_DATA,
  GET_FOLDER_OVERVIEW,
  GET_ORGANIZATION_LIST,
  HANDLE_SYNCED_FILE_FILTER,
  HANDLE_VERIFY_DOCUMENTS,
  SET_INITIALSTATE,
  GET_SUBSCRIPTION_OVERVIEW,
  SET_APIFLAGS_INITIALSTATE,
  HANDLE_DOCUMENT_VERIFICATION_DATA_FILTER,
  GET_DOCUMENT_HASH_BLOCKCHAIN_PROOF,
  GET_EXHIBIT_BLOCKCHAIN_PROOF,
  GET_ORGANIZATION_EXHIBIT_BLOCKCHAIN_PROOF,
  GET_LAB_EXHIBIT_BLOCKCHAIN_PROOF,
  UPDATE_DOCUMENT_EFFECTIVE_DATE,
} from "../actionTypes";
import { API } from "../apis";

export const updateDocumentEffectiveDate = (params) => async (dispatch) => {
  try {
    dispatch({
      type: UPDATE_DOCUMENT_EFFECTIVE_DATE,
      payload: {
        isLoading: true,
      },
    });
    const response = await API.updateDocumentEffectiveDate(params);
    dispatch({
      type: UPDATE_DOCUMENT_EFFECTIVE_DATE,
      payload: {
        ...response,
        isLoading: false,
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const getLabDocumentHashBlockchainProof =
  (params) => async (dispatch) => {
    try {
      dispatch({
        type: GET_LAB_EXHIBIT_BLOCKCHAIN_PROOF,
      });
      const response = await API.getDocumentHashBlockchainProof(params);
      dispatch({
        type: GET_LAB_EXHIBIT_BLOCKCHAIN_PROOF,
        payload: response,
      });
    } catch (error) {
      console.log(error);
    }
  };

export const getExhibitBlockchainProof = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_EXHIBIT_BLOCKCHAIN_PROOF,
    });
    const response = await API.getDocumentHashBlockchainProof(params);
    dispatch({
      type: GET_EXHIBIT_BLOCKCHAIN_PROOF,
      payload: response,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getOrganizationExhibitBlockchainProof =
  (params) => async (dispatch) => {
    try {
      dispatch({
        type: GET_ORGANIZATION_EXHIBIT_BLOCKCHAIN_PROOF,
      });
      const response = await API.getDocumentHashBlockchainProof(params);
      dispatch({
        type: GET_ORGANIZATION_EXHIBIT_BLOCKCHAIN_PROOF,
        payload: response,
      });
    } catch (error) {
      console.log(error);
    }
  };

export const getDocumentHashBlockchainProof = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_DOCUMENT_HASH_BLOCKCHAIN_PROOF,
    });
    const response = await API.getDocumentHashBlockchainProof(params);
    dispatch({
      type: GET_DOCUMENT_HASH_BLOCKCHAIN_PROOF,
      payload: response,
    });
  } catch (error) {
    console.log(error);
  }
};

export const handleDocumentVerificationDataFilter =
  (params) => async (dispatch) => {
    dispatch({
      type: HANDLE_DOCUMENT_VERIFICATION_DATA_FILTER,
      payload: params,
    });
  };

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

export const getSubscriptionOverview = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_SUBSCRIPTION_OVERVIEW,
    });
    const response = await API.getSubscriptionOverview(params);
    dispatch({
      type: GET_SUBSCRIPTION_OVERVIEW,
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
      payload: {
        isLoading: true,
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
      payload: {
        isLoading: false,
      },
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

export const setApiFlagsInitialState = (params) => (dispatch) => {
  dispatch({
    type: SET_APIFLAGS_INITIALSTATE,
    payload: params,
  });
};
