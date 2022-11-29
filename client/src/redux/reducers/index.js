import {
  GET_DASHBOARD_OVERVIEW_DATA,
  HANDLE_SYNCED_FILE_FILTER,
  SOCKET_DOCUMENT_VERIFICATION_PROGRESS,
  GET_ORGANIZATION_LIST,
  GET_FOLDER_OVERVIEW,
  HANDLE_VERIFY_DOCUMENTS,
  SET_INITIALSTATE,
} from "../actionTypes";

const initialState = {
  dashboardOverview: {
    isLoading: false,
    status: "",
    message: "",
    data: null,
    filteredFiles: [],
  },
  syncedFilesFilter: {
    searchText: "",
    isFilterData: false,
  },
  docVerificationProgress: {
    totalFile: 0,
    verificationCompletedCount: 0,
    verificationType: "",
    fileName: "",
    filePath: "",
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
  },
};

const Reducer = (
  previousState = initialState,
  { type, payload = {} },
  state
) => {
  switch (type) {
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
        documentVerificationData: {
          ...previousState.documentVerificationData,
          isLoading: !previousState.documentVerificationData.isLoading,
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
            ? `Total Files: ${payload?.filesCount}`
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
        docVerificationProgress: {
          ...previousState.docVerificationProgress,
          totalFile:
            payload?.filesCount ||
            previousState.docVerificationProgress?.totalFile,
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
      let docVerificationProgress = {
        ...previousState.docVerificationProgress,
        ...payload,
      };
      if (payload?.verificationType === "end") {
        docVerificationProgress["verificationCompletedCount"] =
          docVerificationProgress?.verificationCompletedCount + 1;
      }
      return {
        ...previousState,
        docVerificationProgress,
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
