const {
  sort,
  getData,
  getFolderOverview,
  generateHashForVerifier,
  filterObj,
  setData,
  setFolderPathToArray,
} = require("../utils");
const {
  verifyDocument,
  getSubscriptionDetail,
  verifyDocumentOrganizations,
  updateDocumentEffectiveDateIntoHealthLOQ,
} = require("../services/healthloq");
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const json2csv = require("json2csv").parse;

exports.getDashboardData = async (req, res) => {
  const data = await getData();
  let staticData = localStorage.getItem("staticData");
  if (staticData) {
    staticData = JSON.parse(staticData);
  }
  res.status(200).json({
    status: "1",
    data: {
      lastSyncedDate:
        staticData?.lastSyncedDate ||
        sort("createdAt", data).reverse()[0]?.createdAt,
      totalFiles: data.length,
      files: sort("createdAt", data).reverse() || [],
    },
  });
};

exports.getFolderOverviewData = async (req, res) => {
  const { folderPath } = req.body;
  const docData = await getData("documentVerificationData");
  let newData = [];
  if (folderPath) {
    docData.filter((doc) => {
      if (doc.path.includes(folderPath)) {
        const lastSlashIndex = doc.path.lastIndexOf("/");
        const normalizedPath =
          lastSlashIndex !== -1
            ? doc.path.substring(0, lastSlashIndex)
            : doc.path;
        if (normalizedPath === folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath) {
          newData.push(doc);
        }
      }
    });
  }

  const dataCount = {};
  const previousData = newData.map((doc) => ({
    "Organization Name": doc?.org_name,
    Message: doc?.message,
    "Error Message": doc?.err_message,
    "Is Verified Organization": doc.is_vrf_org,
    "File Name": doc.fileName,
    "File Path": doc.path,
    "Is Verified Document": doc.is_vrf_doc,
    Created: doc.createdAt,
  }));

  dataCount["noOfVerifiedDocumentsWithVerifiedOrg"] = newData?.filter(
    (item) => item["is_vrf_org"] === "Yes" && item["is_vrf_doc"] === "Yes"
  )?.length;

  dataCount["noOfVerifiedDocumentsWithUnVerifiedOrg"] = newData?.filter(
    (item) =>
      (item["is_vrf_org"] === "No" || item["is_vrf_org"] === "") &&
      item["is_vrf_doc"] === "Yes"
  )?.length;

  dataCount["noOfUnverifiedDocuments"] = newData?.filter(
    (item) => item["is_vrf_doc"] === "No"
  )?.length;

  const folderOverview = await getFolderOverview(folderPath);
  res.status(200).json({
    status: "1",
    data: folderOverview,
    count: dataCount,
    doc: previousData,
  });
};

exports.getSubscriptionOverview = async (req, res) => {
  try {
    const subscriptionDetails = await getSubscriptionDetail();
    res.status(200).json({
      ...subscriptionDetails,
    });
  } catch (error) {
    res.status(422).json({
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
    global.isVerifierScriptRunning = true;
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
    const {
      data: documentHashData,
      unreadFiles,
      unreadFolders,
    } = await generateHashForVerifier(folderPath);
    for (let i = 0; i < documentHashData?.length; i += docVerificationLimit) {
      if (!global.isVerifierScriptRunning) {
        break;
      }
      const arr = documentHashData?.slice(i, i + docVerificationLimit);
      if (arr?.length) {
        // verify documents in blockchain
        const response = await verifyDocument({
          hashList: arr?.map((item) => item?.hash),
          organizationIds,
        });
        if (response?.status === "0") {
          errorMsg = response?.message;
          break;
        }
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
          if (response?.data?.data) {
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
            ]
          }
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
    if (global.isVerifierScriptRunning) {
      const mergeData = [];
      for (let resultItem of finalResult) {
        const docVerificationObj = {};
        for (let hashDataItem of documentHashData) {
          if (resultItem["File Path"] === hashDataItem.path) {
            docVerificationObj["fileName"] = hashDataItem.fileName;
            docVerificationObj["org_name"] = resultItem["Organization Name"];
            docVerificationObj["err_message"] = resultItem["Error Message"];
            docVerificationObj["message"] = resultItem["Message"];
            docVerificationObj["path"] = hashDataItem.path;
            docVerificationObj["hash"] = hashDataItem.hash;
            docVerificationObj["state"] = hashDataItem.state;
            docVerificationObj["createdAt"] = hashDataItem.createdAt;
            docVerificationObj["is_vrf_org"] =
              resultItem["Is Verified Organization"];
            docVerificationObj["is_vrf_doc"] =
              resultItem["Is Verified Document"];
          }
          mergeData.push(docVerificationObj);
        }
      }
      let oldData;
      oldData = await getData("documentVerificationData");
      let newData = oldData?.concat(mergeData);
      setData(newData, "documentVerificationData");
    }

    if (global.isVerifierScriptRunning) {
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
        unreadFiles,
        unreadFolders,
      });
    }
    if (global.isVerifierScriptRunning) {
      setFolderPathToArray(folderPath);
    }

    global.isVerifierScriptRunning = false;
  } catch (error) {
    console.log(error);
    global.isVerifierScriptRunning = false;
  }
};

exports.updateDocumentEffectiveDate = async (req, res) => {
  try {
    const healthloqRes = await updateDocumentEffectiveDateIntoHealthLOQ(
      req.body
    );
    if (healthloqRes.status !== "1") {
      return res.status(200).json({
        status: "0",
        message: healthloqRes?.message,
      });
    }
    let data = await getData();
    data = data?.map((item) =>
      req.body?.hashList?.includes(item?.hash)
        ? {
          ...item,
          effective_date: req.body?.effective_date,
        }
        : item
    );
    setData(data);
    res.status(200).json(healthloqRes);
  } catch (error) {
    res.status(422).json({
      status: "0",
      message: error.message,
    });
  }
};

exports.getFolderPath = async (req, res) => {
  try {
    let data = JSON.parse(localStorage.getItem("folderPath")) || [];
    res.status(200).json({
      status: "1",
      data,
    });
  } catch (error) {
    res.status(422).json({
      status: "0",
      message: error.message,
    });
  }
};

exports.getVerifyDocumentCount = async (req, res) => {
  try {
    const data = {};
    const docData = await getData("documentVerificationData");
    const { path } = req?.query;

    let newData = [];

    if (path) {
      docData.filter((doc) => {
        if (doc.path.includes(path)) {
          const lastSlashIndex = doc.path.lastIndexOf("/");
          const normalizedPath =
            lastSlashIndex !== -1
              ? doc.path.substring(0, lastSlashIndex)
              : doc.path;
          if (normalizedPath === path.endsWith("/") ? path.slice(0, -1) : path) {
            newData.push(doc);
          }
        }
      });
    }
    const previousData = newData.map((doc) => ({
      "Organization Name": doc?.org_name,
      Message: doc?.message,
      "Error Message": doc?.err_message,
      "Is Verified Organization": doc.is_vrf_org,
      "File Name": doc.fileName,
      "File Path": doc.path,
      "Is Verified Document": doc.is_vrf_doc,
      Created: doc.createdAt,
    }));

    data["noOfVerifiedDocumentsWithVerifiedOrg"] = newData?.filter(
      (item) => item["is_vrf_org"] === "Yes" && item["is_vrf_doc"] === "Yes"
    )?.length;

    data["noOfVerifiedDocumentsWithUnVerifiedOrg"] = newData?.filter(
      (item) =>
        (item["is_vrf_org"] === "No" || item["is_vrf_org"] === "") &&
        item["is_vrf_doc"] === "Yes"
    )?.length;

    data["noOfUnverifiedDocuments"] = newData?.filter(
      (item) => item["is_vrf_doc"] === "No"
    )?.length;

    res.status(200).json({
      status: "1",
      data,
      doc: previousData,
    });
  } catch (error) {
    res.status(422).json({
      status: "0",
      message: error.message,
    });
  }
};
