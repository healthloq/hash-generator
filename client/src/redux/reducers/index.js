import {
  GET_DASHBOARD_OVERVIEW_DATA,
  HANDLE_SYNCED_FILE_FILTER,
  SOCKET_DOCUMENT_VERIFICATION_PROGRESS,
  GET_ORGANIZATION_LIST,
  GET_FOLDER_OVERVIEW,
  HANDLE_VERIFY_DOCUMENTS,
  SET_INITIALSTATE,
  SOCKET_DOCUMENT_VERIFICATION_RESULT,
  GET_SUBSCRIPTION_OVERVIEW,
  SOCKET_DOCUMENT_UPLOAD_LIMIT_EXCEEDED_ERROR,
} from "../actionTypes";
import { numberWithCommas } from "../../utils";

const initialState = {
  dashboardOverview: {
    isLoading: false,
    status: "",
    message: "",
    data: null,
    filteredFiles: [],
    errorMsg: "",
  },
  syncedFilesFilter: {
    searchText: "",
    isFilterData: false,
  },
  organizationList: {
    isLoading: false,
    data: [],
  },
  folderOverview: {
    isLoading: false,
    errorMsg: "",
    successMsg: "",
    filesCount: 0,
  },
  documentVerificationData: {
    isLoading: false,
    status: "",
    message: "",
    data: [],
    totalFilesCount: 0,
    verifiedFilesCount: 0,
    verificationType: "",
    fileName: "",
    filePath: "",
    noOfVerifiedDocuments: 0,
    noOfUnverifiedDocuments: 0,
    noOfErrors: 0,
    verificationData: [],
    errorMsg: "",
    url: "",
    isDocVerificationFinalOverview: false,
  },
  subscriptionDetails: {
    isLoading: false,
    status: "",
    message: "",
    data: [],
    subscriptionList: [],
  },
};

const Reducer = (
  previousState = initialState,
  { type, payload = {} },
  state
) => {
  switch (type) {
    case SOCKET_DOCUMENT_UPLOAD_LIMIT_EXCEEDED_ERROR: {
      return {
        ...previousState,
        dashboardOverview: {
          ...previousState.dashboardOverview,
          ...payload,
        },
      };
    }
    case GET_SUBSCRIPTION_OVERVIEW: {
      const subscriptionDetails = {
        ...previousState.subscriptionDetails,
        isLoading: !previousState.subscriptionDetails.isLoading,
        ...payload,
      };
      if (!subscriptionDetails?.isLoading) {
        subscriptionDetails["subscriptionList"] =
          subscriptionDetails?.data?.map((item) => item?.subscription_type);
      }
      return {
        ...previousState,
        subscriptionDetails,
      };
    }
    case SOCKET_DOCUMENT_VERIFICATION_RESULT: {
      return {
        ...previousState,
        documentVerificationData: {
          ...previousState.documentVerificationData,
          isLoading: false,
          ...payload,
        },
      };
    }
    case SET_INITIALSTATE: {
      return Object.assign(
        previousState,
        payload?.length > 0
          ? Object.fromEntries(
              Object.entries(initialState).filter(([key]) =>
                payload.includes(key)
              )
            )
          : {}
      );
    }
    case HANDLE_VERIFY_DOCUMENTS: {
      return {
        ...previousState,
        documentVerificationData: payload.isLoading
          ? {
              ...initialState.documentVerificationData,
              ...payload,
              totalFilesCount:
                previousState.documentVerificationData.totalFilesCount,
            }
          : {
              ...previousState.documentVerificationData,
              ...payload,
            },
      };
    }
    case GET_FOLDER_OVERVIEW: {
      let folderOverview = { ...previousState.folderOverview };
      if (payload?.filesCount) {
        folderOverview = {
          ...payload,
          successMsg: !payload?.errorMsg
            ? `Total Files: ${numberWithCommas(parseInt(payload?.filesCount))}`
            : "",
        };
      } else {
        folderOverview = {
          ...initialState.folderOverview,
          ...payload,
        };
      }
      return {
        ...previousState,
        folderOverview,
        documentVerificationData: {
          ...previousState.documentVerificationData,
          totalFilesCount: payload?.isLoading
            ? previousState.documentVerificationData.totalFilesCount
            : payload?.filesCount || 0,
        },
      };
    }
    case GET_ORGANIZATION_LIST: {
      return {
        ...previousState,
        organizationList: {
          ...previousState.organizationList,
          ...payload,
        },
      };
    }
    case SOCKET_DOCUMENT_VERIFICATION_PROGRESS: {
      return {
        ...previousState,
        documentVerificationData: {
          ...previousState.documentVerificationData,
          ...payload,
          verifiedFilesCount:
            payload?.verificationType === "end"
              ? previousState.documentVerificationData.verifiedFilesCount + 1
              : previousState.documentVerificationData.verifiedFilesCount,
        },
      };
    }
    case GET_DASHBOARD_OVERVIEW_DATA: {
      return {
        ...previousState,
        dashboardOverview: {
          ...previousState.dashboardOverview,
          isLoading: !previousState.dashboardOverview.isLoading,
          ...payload,
          filteredFiles: payload?.data?.files,
        },
      };
    }
    case HANDLE_SYNCED_FILE_FILTER: {
      const dashboardOverview = { ...previousState.dashboardOverview };
      const searchText =
        payload?.searchText || previousState.syncedFilesFilter.searchText;
      if (payload?.isFilterData) {
        if (payload?.searchText === "")
          dashboardOverview["filteredFiles"] = dashboardOverview?.data?.files;
        else {
          const regExp = new RegExp(searchText, "i");
          dashboardOverview["filteredFiles"] =
            dashboardOverview?.filteredFiles?.filter((file) =>
              regExp.test(file?.fileName)
            );
        }
      }
      return {
        ...previousState,
        syncedFilesFilter: {
          ...previousState.syncedFilesFilter,
          ...payload,
          isFilterData: !payload?.isFilterData,
        },
        dashboardOverview,
      };
    }
    default:
      return previousState || initialState;
  }
};
export default Reducer;
