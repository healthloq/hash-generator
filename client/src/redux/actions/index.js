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
  GET_FOLDER_PATH,
  GET_VERIFY_DOCUMENT_COUNT,
  HANDLE_FILTER_VALUE,
  START_VERIFY_DOCUMENT_BLOCKCHAIN_PROOF_OR_NOT,
  SUCCESS_VERIFY_DOCUMENT_BLOCKCHAIN_PROOF_OR_NOT,
  ERROR_VERIFY_DOCUMENT_BLOCKCHAIN_PROOF_OR_NOT,
  SUCCESS_GET_ORGANIZATION_LIST,
  START_GET_ORGANIZATION_LIST,
  ERROR_GET_ORGANIZATION_LIST,
  START_GET_ORGANIZATION_LOCATION_LIST,
  SUCCESS_GET_ORGANIZATION_LOCATION_LIST,
  ERROR_GET_ORGANIZATION_LOCATION_LIST,
  START_GET_PRODUCT_LIST,
  SUCCESS_GET_PRODUCT_LIST,
  ERROR_GET_PRODCUT_LIST,
  START_GET_PRODUCT_BATCH_LIST,
  SUCCESS_GET_PRODUCT_BATCH_LIST,
  ERROR_GET_PRODUCT_BATCH_LIST,
  RESET_STATE_META_DATA_STATE,
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

export const getBlockChainProofData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: START_VERIFY_DOCUMENT_BLOCKCHAIN_PROOF_OR_NOT,
    });

    const response = await API.getDocumentHashBlockChainProofNew(params);

    dispatch({
      type: SUCCESS_VERIFY_DOCUMENT_BLOCKCHAIN_PROOF_OR_NOT,
      payload: response,
    });
  } catch (error) {
    dispatch({
      type: ERROR_VERIFY_DOCUMENT_BLOCKCHAIN_PROOF_OR_NOT,
    });
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

export const handleFilterValue = (params) => async (dispatch) => {
  dispatch({
    type: HANDLE_FILTER_VALUE,
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

export const fetchFolderPath = () => async (dispatch) => {
  try {
    dispatch({
      type: GET_FOLDER_PATH,
      payload: {
        isLoading: true,
      },
    });
    const response = await API.getFolderPath();
    dispatch({
      type: GET_FOLDER_PATH,
      payload: { ...response, isLoading: false },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_FOLDER_PATH,
      payload: {
        isLoading: false,
      },
    });
  }
};

export const fetchVerifyDocumentCount = (params) => async (dispatch) => {
  try {
    dispatch({
      type: GET_VERIFY_DOCUMENT_COUNT,
      payload: {
        isLoading: true,
      },
    });
    const response = await API.getVerifyDocumentCount(params);
    dispatch({
      type: GET_VERIFY_DOCUMENT_COUNT,
      payload: { ...response, isLoading: false },
    });
  } catch (error) {
    console.log(error);
    dispatch({
      type: GET_VERIFY_DOCUMENT_COUNT,
      payload: {
        isLoading: false,
      },
    });
  }
};

export const getOrganizationListMetaData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: START_GET_ORGANIZATION_LIST,
    });

    const response = await API.getOrganizationList(params);
    dispatch({
      type: SUCCESS_GET_ORGANIZATION_LIST,
      payload: response,
    });
  } catch (error) {
    dispatch({
      type: ERROR_GET_ORGANIZATION_LIST,
    });
  }
};

export const getOrganizationLocationMetaData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: START_GET_ORGANIZATION_LOCATION_LIST,
    });

    const response = await API.getOrganizationLocationList(params);

    dispatch({
      type: SUCCESS_GET_ORGANIZATION_LOCATION_LIST,
      payload: response,
    });
  } catch (error) {
    dispatch({
      type: ERROR_GET_ORGANIZATION_LOCATION_LIST,
    });
  }
};

export const getProductListMetaData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: START_GET_PRODUCT_LIST,
    });

    const response = await API.getProductList(params);

    dispatch({
      type: SUCCESS_GET_PRODUCT_LIST,
      payload: response,
    });
  } catch (error) {
    dispatch({
      type: ERROR_GET_PRODCUT_LIST,
    });
  }
};

export const getProductBatchListMetaData = (params) => async (dispatch) => {
  try {
    dispatch({
      type: START_GET_PRODUCT_BATCH_LIST,
    });

    const response = await API.getProductBatchList(params);

    dispatch({
      type: SUCCESS_GET_PRODUCT_BATCH_LIST,
      payload: response,
    });
  } catch (error) {
    dispatch({
      type: ERROR_GET_PRODUCT_BATCH_LIST,
    });
  }
};

export const resetMetaDataState = () => async (dispatch) => {
  dispatch({
    type: RESET_STATE_META_DATA_STATE,
  });
};
