const { default: axios } = require("axios");

exports.syncHash = async (data) => {
  let response = null;
  try {
    if (data.hashList.length || data.deletedHashList.length) {
      console.log("Start syncing with healthloq db...");
      response = await axios.post(
        `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/createOrDelete`,
        data,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
          },
        }
      );
      if (response?.data.status === "1")
        console.log("Hash synced with healthloq successful");
      else console.log(response?.data.message);
      if (response?.data?.status === "2") {
        io.sockets.emit("docUploadLimitExceededError", {
          errorMsg: response?.data?.message,
        });
      }
      if (response?.data?.message === "0") {
        this.publisherScriptIsRunningOrNot({
          is_running: false,
          error_msg: response?.data?.message,
        });
      }
    }
  } catch (error) {
    if (error.response) {
      console.log(`API Error: ${error.response.status} - ${error.response.statusText}`)
    }
    console.log("sync hash with healthloq catch block", error);
  }
  return response?.data?.status || "0";
};

exports.verifyDocument = async (params) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/verify-document`,
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.log(error);
    if (error.response) {
      return {
        status: "0",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data.message,
      };
    }
    return {
      status: "0",
      message: error.message,
    };
  }
};

exports.verifyDocumentOrganizations = async (params) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/verify-document-organizations`,
      params,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.log(error);
    if (error.response) {
      return {
        status: "0",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data.message,
      };
    }
    return {
      status: "0",
      message: error.message,
    };
  }
};

exports.getSubscriptionDetail = async () => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/get-subscription-details`,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.log(error);
    if (error.response) {
      return {
        status: "0",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data.message,
      };
    }
    return {
      status: "0",
      message: error.message,
    };
  }
};

exports.syncDocToolLogs = async (data = {}) => {
  try {
    if (data?.error) {
      data.error = JSON.stringify(data?.error);
    }
    const response = await axios.post(
      `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/sync-doc-tool-logs`,
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.log("syncDocToolLogs => ", error);
    if (error.response) {
      return {
        status: "0",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data.message,
      };
    }
    return {
      status: "0",
      message: error.message,
    };
  }
};

exports.publisherScriptIsRunningOrNot = async (data = {}) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/publisher-script-is-running-or-not`,
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.log("publisherScriptIsRunningOrNot => ", error);
    if (error.response) {
      return {
        status: "0",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data.message,
      };
    }
    return {
      status: "0",
      message: error.message,
    };
  }
};

exports.updateDocumentEffectiveDateIntoHealthLOQ = async (data = {}) => {
  try {
    const response = await axios.post(
      `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/update`,
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
        },
      }
    );
    return response?.data;
  } catch (error) {
    console.log("updateDocumentEffectiveDateIntoHealthLOQ => ", error);
    if (error.response) {
      return {
        status: "0",
        message: `API Error: ${error.response.status} - ${error.response.statusText}`,
        details: error.response.data.message,
      };
    }
    return {
      status: "0",
      message: error.message,
    };
  }
};
