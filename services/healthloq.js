const { default: axios } = require("axios");

exports.syncHash = async (data) => {
  try {
    if (data.hashList.length || data.deletedHashList.length) {
      console.log("Start syncing with healthloq db...");
      const response = await axios.post(
        `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/document-hash/createOrDelete`,
        data,
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_JWT_TOKEN}`,
          },
        }
      );
      if (response.data.status === "1")
        console.log("Hash synced with healthloq successful");
      else console.log(response.data.message);
      if (response?.data?.status === "2") {
        io.sockets.emit("docUploadLimitExceededError", {
          errorMsg: response?.data?.message,
        });
      }
    }
  } catch (error) {
    console.log("sync hash with healthloq catch block", error);
  }
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
    return {
      status: "0",
      message: error.message,
    };
  }
};
