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
  SET_APIFLAGS_INITIALSTATE,
  HANDLE_DOCUMENT_VERIFICATION_DATA_FILTER,
  GET_DOCUMENT_HASH_BLOCKCHAIN_PROOF,
  GET_EXHIBIT_BLOCKCHAIN_PROOF,
  GET_ORGANIZATION_EXHIBIT_BLOCKCHAIN_PROOF,
  GET_LAB_EXHIBIT_BLOCKCHAIN_PROOF,
  UPDATE_DOCUMENT_EFFECTIVE_DATE,
  GET_FOLDER_PATH,
} from "../actionTypes";
import { abbrNum } from "../../utils";

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
    noOfVerifiedDocumentsWithVerifiedOrg: 0,
    noOfVerifiedDocumentsWithUnVerifiedOrg: 0,
    noOfUnverifiedDocuments: 0,
    verificationData: [],
    errorMsg: "",
    url: "",
    isDocVerificationFinalOverview: false,
    filteredVerificationData: [],
    newFilesCount: 0,
  },
  documentVerificationFilters: {
    verificationType: "all",
  },
  subscriptionDetails: {
    isLoading: false,
    status: "",
    message: "",
    data: [],
    subscriptionList: [],
  },
  apiFlags: {
    subscriptionDetailFlag: false,
    downloadVerifierResultCSVFlag: false,
  },
  documentHashBlockchainProof: {
    isLoading: false,
  },
  labDocumentHashBlockchainProof: {
    isLoading: false,
  },
  exhibitBlockchainProof: {
    isLoading: false,
  },
  organizationExhibitBlockchainProof: {
    isLoading: false,
  },
  updateEffectiveDateData: {
    isLoading: false,
  },
  getFolderPathList: {
    isLoading: false,
    data: [],
  },
};

const Reducer = (
  previousState = initialState,
  { type, payload = {} },
  state
) => {
  switch (type) {
    case UPDATE_DOCUMENT_EFFECTIVE_DATE: {
      return {
        ...previousState,
        updateEffectiveDateData: payload,
        ...(Boolean(
          !payload?.isLoading &&
            payload?.status === "1" &&
            payload?.data?.hashList?.length
        )
          ? {
              dashboardOverview: {
                ...previousState.dashboardOverview,
                data: {
                  ...previousState?.dashboardOverview?.data,
                  files: (
                    previousState?.dashboardOverview?.data?.files || []
                  )?.map((item) => {
                    return payload?.data?.hashList?.includes(item?.hash)
                      ? {
                          ...item,
                          effective_date: payload?.data?.effective_date,
                        }
                      : item;
                  }),
                },
                filteredFiles: (
                  previousState?.dashboardOverview?.filteredFiles || []
                )?.map((item) => {
                  return payload?.data?.hashList?.includes(item?.hash)
                    ? {
                        ...item,
                        effective_date: payload?.data?.effective_date,
                      }
                    : item;
                }),
              },
            }
          : {}),
      };
    }
    case GET_EXHIBIT_BLOCKCHAIN_PROOF: {
      return {
        ...previousState,
        exhibitBlockchainProof: {
          ...previousState.exhibitBlockchainProof,
          isLoading: !previousState.exhibitBlockchainProof.isLoading,
          ...payload,
          isError: !!previousState.exhibitBlockchainProof.isLoading
            ? Object.keys(payload)?.filter((key) =>
                ["blockAddress", "data", "result"].includes(key)
              ).length !== 3
            : false,
        },
      };
    }
    case GET_ORGANIZATION_EXHIBIT_BLOCKCHAIN_PROOF: {
      return {
        ...previousState,
        organizationExhibitBlockchainProof: {
          ...previousState.organizationExhibitBlockchainProof,
          isLoading:
            !previousState.organizationExhibitBlockchainProof.isLoading,
          ...payload,
          isError: !!previousState.organizationExhibitBlockchainProof.isLoading
            ? Object.keys(payload)?.filter((key) =>
                ["blockAddress", "data", "result"].includes(key)
              ).length !== 3
            : false,
        },
      };
    }
    case GET_DOCUMENT_HASH_BLOCKCHAIN_PROOF: {
      return {
        ...previousState,
        documentHashBlockchainProof: {
          ...previousState.documentHashBlockchainProof,
          isLoading: !previousState.documentHashBlockchainProof.isLoading,
          ...payload,
          isError: !!previousState.documentHashBlockchainProof.isLoading
            ? Object.keys(payload)?.filter((key) =>
                ["blockAddress", "data", "result"].includes(key)
              ).length !== 3
            : false,
        },
      };
    }
    case GET_LAB_EXHIBIT_BLOCKCHAIN_PROOF: {
      return {
        ...previousState,
        labDocumentHashBlockchainProof: {
          ...previousState.labDocumentHashBlockchainProof,
          isLoading: !previousState.labDocumentHashBlockchainProof.isLoading,
          ...payload,
          isError: !!previousState.labDocumentHashBlockchainProof.isLoading
            ? Object.keys(payload)?.filter((key) =>
                ["blockAddress", "data", "result"].includes(key)
              ).length !== 3
            : false,
        },
      };
    }
    case HANDLE_DOCUMENT_VERIFICATION_DATA_FILTER: {
      const documentVerificationData = {
        ...previousState.documentVerificationData,
      };
      if (payload?.verificationType) {
        if (payload?.verificationType === "all")
          documentVerificationData["filteredVerificationData"] =
            documentVerificationData?.verificationData;
        else if (payload?.verificationType === "verifiedDocWithVerifiedOrg")
          documentVerificationData["filteredVerificationData"] =
            documentVerificationData?.verificationData?.filter(
              (item) =>
                item["Is Verified Document"] === "Yes" &&
                item["Is Verified Organization"] === "Yes"
            );
        else if (payload?.verificationType === "verifiedDocWithUnverifiedOrg")
          documentVerificationData["filteredVerificationData"] =
            documentVerificationData?.verificationData?.filter(
              (item) =>
                item["Is Verified Document"] === "Yes" &&
                item["Is Verified Organization"] === "No"
            );
        else if (payload?.verificationType === "unverifiedDoc")
          documentVerificationData["filteredVerificationData"] =
            documentVerificationData?.verificationData?.filter(
              (item) => item["Is Verified Document"] === "No"
            );
        else
          documentVerificationData["filteredVerificationData"] =
            documentVerificationData?.verificationData;
      }
      return {
        ...previousState,
        documentVerificationFilters: {
          ...previousState.documentVerificationFilters,
          ...payload,
        },
        documentVerificationData,
      };
    }
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
          filteredVerificationData: payload?.verificationData || [],
        },
        apiFlags: {
          ...previousState.apiFlags,
          subscriptionDetailFlag:
            payload?.isDocVerificationFinalOverview ||
            previousState.apiFlags.subscriptionDetailFlag,
          downloadVerifierResultCSVFlag:
            Boolean(payload?.url) ||
            previousState.apiFlags.downloadVerifierResultCSVFlag,
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
    case SET_APIFLAGS_INITIALSTATE: {
      return {
        ...previousState,
        apiFlags: Object.assign(
          previousState.apiFlags,
          Object.fromEntries(
            payload?.map((key) => [key, initialState.apiFlags[key]])
          )
        ),
      };
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
              newFilesCount:
                previousState.documentVerificationData.newFilesCount,
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
            ? `Total Files: ${abbrNum(
                parseInt(payload?.filesCount)
              )}, New Files: ${abbrNum(parseInt(payload?.newFilesCount))}`
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
          newFilesCount: payload?.isLoading
            ? previousState.documentVerificationData.newFilesCount
            : payload?.newFilesCount || 0,
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
    case GET_FOLDER_PATH: {
      return {
        ...previousState,
        getFolderPathList: {
          ...previousState.getFolderPathList,
          ...payload,
        },
      };
    }
    default:
      return previousState || initialState;
  }
};
export default Reducer;
