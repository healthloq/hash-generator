const {
  sort,
  getData,
  getFolderOverview,
  generateHash,
  filterObj,
} = require("../utils");
const {
  verifyDocument,
  getSubscriptionDetail,
  verifyDocumentOrganizations,
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
    const organizationIds = selectedOrganizations?.map((item) => item?.id);
    // Verify document organizations
    let docOrgVerificationData = [];
    try {
      let response = await verifyDocumentOrganizations({
        organizationIds,
      });
      if (response?.data?.length) {
        docOrgVerificationData = response?.data;
      }
    } catch (error) {
      console.log(error);
    }
    // Verify documents
    const docVerificationLimit = 100; // No of documents verify at a time
    let finalResult = [];
    let errorMsg = "";
    const documentHashData = await generateHash(folderPath);
    for (let i = 0; i < documentHashData?.length; i += docVerificationLimit) {
      const arr = documentHashData?.slice(i, i + docVerificationLimit);
      if (arr?.length) {
        // verify documents in blockchain
        const response = await verifyDocument({
          hashList: arr?.map((item) => item?.hash),
          organizationIds,
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
              const orgVerificationInfo =
                docOrgVerificationData?.filter(
                  (a) => a?.organization_id === item?.organization_id
                )[0] || null;
              return {
                "Organization Name": orgInfo?.name || "",
                "Is Verified Organization": orgVerificationInfo
                  ? orgVerificationInfo?.isVerifiedOrg
                    ? "Yes"
                    : "No"
                  : "",
                "File Name": fileInfo?.fileName,
                "File Path": fileInfo?.path,
                "Is Verified Document": item?.isVerifiedDocument,
                Created: item?.created_on
                  ? moment(item?.created_on).format("DD MMMM, YYYY hh:mm A")
                  : null,
                Message: item?.message,
                "Error Message": "",
                integrantId: item?.integrantId,
                OrganizationExhibitId: item?.OrganizationExhibitId,
                documentHashId: item?.documentHashId,
                labDocumentHashId: item?.labDocumentHashId,
              };
            }),
          ];
          io.sockets.emit("documentVerificationUpdate", {
            verifiedFilesCount: finalResult?.length,
          });
          // Stop document verification if subscription limit
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
              const orgVerificationInfo =
                docOrgVerificationData?.filter(
                  (a) => a?.organization_id === item?.organization_id
                )[0] || null;
              return {
                "Organization Name": orgInfo?.name || "",
                "Is Verified Organization": orgVerificationInfo
                  ? orgVerificationInfo?.isVerifiedOrg
                    ? "Yes"
                    : "No"
                  : "",
                "File Name": fileInfo?.fileName,
                "File Path": fileInfo?.path,
                "Is Verified Document": item?.isVerifiedDocument,
                Created: item?.created_on
                  ? moment(item?.created_on).format("DD MMMM, YYYY hh:mm A")
                  : null,
                Message: item?.message,
                "Error Message": "",
                integrantId: item?.integrantId,
                OrganizationExhibitId: item?.OrganizationExhibitId,
                documentHashId: item?.documentHashId,
                labDocumentHashId: item?.labDocumentHashId,
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
                "Is Verified Organization": "",
                "File Name": item?.fileName,
                "File Path": item?.path,
                "Is Verified Document": null,
                Created: null,
                Message: "",
                "Error Message": `Something went wrong! We are not able to verify the file which located in this location ${item?.path}.`,
                integrantId: null,
                OrganizationExhibitId: null,
                documentHashId: null,
                labDocumentHashId: null,
              };
            }),
          ];
          io.sockets.emit("documentVerificationUpdate", {
            verifiedFilesCount: finalResult?.length,
          });
        }
      }
    }
    // Create document verification final csv
    if (finalResult?.length) {
      const csv = json2csv(
        finalResult?.map((item) =>
          filterObj(item, [
            "documentHashId",
            "OrganizationExhibitId",
            "integrantId",
          ])
        )
      );
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
    // Send final socket for document verfication quick overview and send csv url to export final result
    io.sockets.emit("documentVerificationResult", {
      noOfVerifiedDocumentsWithVerifiedOrg: finalResult?.filter(
        (item) =>
          item["Is Verified Organization"] === "Yes" &&
          item["Is Verified Document"] === "Yes"
      )?.length,
      noOfVerifiedDocumentsWithUnVerifiedOrg: finalResult?.filter(
        (item) =>
          item["Is Verified Organization"] === "No" &&
          item["Is Verified Document"] === "Yes"
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
