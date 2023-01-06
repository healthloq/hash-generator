const { sort, getData, getFolderOverview, generateHash } = require("../utils");
const {
  verifyDocument,
  getSubscriptionDetail,
} = require("../services/healthloq");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const json2csv = require("json2csv").parse;

exports.getDashboardData = async (req, res) => {
  const data = await getData();
  res.status(200).json({
    status: "1",
    data: {
      lastSyncedDate: sort("createdAt", data).reverse()[0]?.createdAt,
      totalFiles: data.length,
      files: sort("createdAt", data).reverse() || [],
    },
  });
};

exports.getFolderOverviewData = async (req, res) => {
  const { folderPath } = req.body;
  const folderOverview = await getFolderOverview(folderPath);
  res.status(200).json({
    status: "1",
    data: folderOverview,
  });
};

exports.getSubscriptionOverview = async (req, res) => {
  try {
    const subscriptionDetails = await getSubscriptionDetail();
    res.status(200).json({
      ...subscriptionDetails,
    });
  } catch (error) {
    res.status(200).json({
      status: "0",
      message: error.message,
    });
  }
};

exports.verifyDocuments = async (req, res) => {
  try {
    const { folderPath, selectedOrganizations } = req.body;
    res.status(200).json({
      status: "1",
      data: [],
    });
    const docVerificationLimit = 500;
    let finalResult = [];
    let errorMsg = "";
    const documentHashData = await generateHash(folderPath);
    for (let i = 0; i < documentHashData?.length; i += docVerificationLimit) {
      const arr = documentHashData?.slice(i, i + docVerificationLimit);
      if (arr?.length) {
        const response = await verifyDocument({
          hashList: arr?.map((item) => item?.hash),
          organizationIds: selectedOrganizations?.map((item) => item?.id),
        });
        if (response?.status === "1") {
          finalResult = [
            ...finalResult,
            ...response?.data?.data?.map((item) => {
              const fileInfo = documentHashData?.filter(
                (a) => a?.hash === item?.hash
              )[0];
              const orgInfo = item?.organization_id
                ? selectedOrganizations?.filter(
                    (a) => a?.id === item?.organization_id
                  )[0]
                : null;
              return {
                "Organization Name": orgInfo?.name || "",
                "File Name": fileInfo?.fileName,
                "File Path": fileInfo?.path,
                "Is Verified Document": item?.isVerifiedDocument,
                Created: item?.created_on
                  ? moment(item?.created_on).format("DD MMMM, YYYY hh:mm A")
                  : null,
                Message: item?.message,
                "Error Message": "",
              };
            }),
          ];
          io.sockets.emit("documentVerificationUpdate", {
            verifiedFilesCount: finalResult?.length,
          });
          if (!response?.data?.userHaveDocVerificationLimit) {
            errorMsg = response?.data?.errorMsg;
            break;
          }
        } else if (response?.status === "2") {
          errorMsg = response?.message;
          finalResult = [
            ...finalResult,
            ...response?.data?.data?.map((item) => {
              const fileInfo = documentHashData?.filter(
                (a) => a?.hash === item?.hash
              )[0];
              const orgInfo = item?.organization_id
                ? selectedOrganizations?.filter(
                    (a) => a?.id === item?.organization_id
                  )[0]
                : null;
              return {
                "Organization Name": orgInfo?.name || "",
                "File Name": fileInfo?.fileName,
                "File Path": fileInfo?.path,
                "Is Verified Document": item?.isVerifiedDocument,
                Created: item?.created_on
                  ? moment(item?.created_on).format("DD MMMM, YYYY hh:mm A")
                  : null,
                Message: item?.message,
                "Error Message": "",
              };
            }),
          ];
          io.sockets.emit("documentVerificationUpdate", {
            verifiedFilesCount: finalResult?.length,
          });
          break;
        } else {
          finalResult = [
            ...finalResult,
            ...arr?.map((item) => {
              return {
                "Organization Name": "",
                "File Name": item?.fileName,
                "File Path": item?.path,
                "Is Verified Document": null,
                Created: null,
                Message: "",
                "Error Message": `Something went wrong! We are not able to verify the file which located in this location ${item?.path}.`,
              };
            }),
          ];
          io.sockets.emit("documentVerificationUpdate", {
            verifiedFilesCount: finalResult?.length,
          });
        }
      }
    }
    if (finalResult?.length) {
      const csv = json2csv(finalResult);
      try {
        fs.writeFileSync(
          path.join(
            __dirname,
            "../public/exports/document-verification-overview.csv"
          ),
          csv
        );
      } catch (error) {
        console.log(error);
      }
    }
    io.sockets.emit("documentVerificationResult", {
      noOfVerifiedDocuments: finalResult?.filter(
        (item) => item["Is Verified Document"] === "Yes"
      )?.length,
      noOfUnverifiedDocuments: finalResult?.filter(
        (item) => item["Is Verified Document"] === "No"
      )?.length,
      verificationData: finalResult,
      errorMsg,
      url: finalResult?.length
        ? `${process.env.REACT_APP_API_BASE_URL}/public/exports/document-verification-overview.csv`
        : null,
      isDocVerificationFinalOverview: true,
    });
  } catch (error) {
    console.log(error);
  }
};
