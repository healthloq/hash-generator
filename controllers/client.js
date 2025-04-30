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
const { Parser } = require("json2csv");

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
        if (
          normalizedPath === folderPath.endsWith("/")
            ? folderPath.slice(0, -1)
            : folderPath
        ) {
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
    labDocumentHashId: doc.labDocumentHashId,
    documentHashId: doc.documentHashId,
    OrganizationExhibitId: doc.OrganizationExhibitId,
    integrantId: doc.integrantId,
    labOrgName: doc.labOrgName,
    hash : doc.hash
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

    // Send immediate response to client
    res.status(200).json({ status: "1", data: [] });

    global.isVerifierScriptRunning = true;
    const organizationIds = selectedOrganizations?.map((item) => item?.id);

    // 1. Verify document organizations
    let docOrgVerificationData = [];
    try {
      const response = await verifyDocumentOrganizations({ organizationIds });
      if (response?.data?.length) docOrgVerificationData = response.data;
    } catch (error) {
      console.log(error);
    }

    // 2. Generate hashes
    const docVerificationLimit = 100;
    let finalResult = [];
    let errorMsg = "";

    const {
      data: documentHashData,
      unreadFiles,
      unreadFolders,
    } = await generateHashForVerifier(folderPath);

    for (let i = 0; i < documentHashData?.length; i += docVerificationLimit) {
      if (!global.isVerifierScriptRunning) break;
      const batch = documentHashData.slice(i, i + docVerificationLimit);

      const response = await verifyDocument({
        hashList: batch.map((item) => item.hash),
        organizationIds,
      });

      if (response?.status === "0") {
        errorMsg = response?.message;
        break;
      }

      const verifiedData = response?.data?.data || [];
      const mappedResult = verifiedData.map((item) => {
        const fileInfo = documentHashData.find((a) => a.hash === item.hash);
        const orgInfo =
          selectedOrganizations.find((a) => a.id === item.organization_id) ||
          {};
        const orgVerificationInfo =
          docOrgVerificationData.find(
            (a) => a.organization_id === item.organization_id
          ) || {};

        return {
          "Organization Name": orgInfo.name || "",
          "Is Verified Organization": orgVerificationInfo?.isVerifiedOrg
            ? "Yes"
            : "No",
          "File Name": fileInfo?.fileName,
          "File Path": fileInfo?.path,
          "Is Verified Document": item?.isVerifiedDocument,
          Created: item?.created_on
            ? moment(item.created_on).format("DD MMMM, YYYY hh:mm A")
            : null,
          Message: item.message,
          "Error Message": "",
          integrantId: item.integrantId,
          OrganizationExhibitId: item.OrganizationExhibitId,
          documentHashId: item.documentHashId,
          labDocumentHashId: item.labDocumentHashId,
          labOrgName: item.labOrgName,
        };
      });

      finalResult.push(...mappedResult);

      io.sockets.emit("documentVerificationUpdate", {
        verifiedFilesCount: finalResult.length,
      });

      if (
        response?.status === "1" &&
        !response.data?.userHaveDocVerificationLimit
      ) {
        errorMsg = response.data?.errorMsg;
        break;
      }
      if (response?.status === "2") break;
    }

    // 3. Merge Data Efficiently
    if (global.isVerifierScriptRunning) {
      const pathMap = new Map(documentHashData.map((d) => [d.path, d]));

      const mergeData = finalResult
        .map((item) => {
          const doc = pathMap.get(item["File Path"]);
          if (!doc) return null;
          return {
            fileName: doc.fileName,
            org_name: item["Organization Name"],
            err_message: item["Error Message"],
            message: item["Message"],
            path: doc.path,
            hash: doc.hash,
            state: doc.state,
            createdAt: doc.createdAt,
            is_vrf_org: item["Is Verified Organization"],
            is_vrf_doc: item["Is Verified Document"],
            labDocumentHashId: item.labDocumentHashId,
            documentHashId: item.documentHashId,
            OrganizationExhibitId: item.OrganizationExhibitId,
            integrantId: item.integrantId,
            labOrgName: item.labOrgName,
          };
        })
        .filter(Boolean);

      const oldData = await getData("documentVerificationData");
      await setData([...oldData, ...mergeData], "documentVerificationData");
    }

    // 4. Stream CSV to File
    if (global.isVerifierScriptRunning && finalResult.length) {
      try {
        const csvParser = new Parser();
        const csv = csvParser.parse(
          finalResult.map((item) =>
            filterObj(item, [
              "documentHashId",
              "OrganizationExhibitId",
              "integrantId",
            ])
          )
        );
        const filePath = path.join(
          __dirname,
          "../public/exports/document-verification-overview.csv"
        );
        fs.writeFileSync(filePath, csv); // Optional: convert this to stream if file size is very large
      } catch (error) {
        console.log("CSV write failed", error);
      }
    }

    // 5. Final Socket Emit
    if (global.isVerifierScriptRunning) {
      io.sockets.emit("documentVerificationResult", {
        noOfVerifiedDocumentsWithVerifiedOrg: finalResult.filter(
          (item) =>
            item["Is Verified Organization"] === "Yes" &&
            item["Is Verified Document"] === "Yes"
        ).length,
        noOfVerifiedDocumentsWithUnVerifiedOrg: finalResult.filter(
          (item) =>
            item["Is Verified Organization"] === "No" &&
            item["Is Verified Document"] === "Yes"
        ).length,
        noOfUnverifiedDocuments: finalResult.filter(
          (item) => item["Is Verified Document"] === "No"
        ).length,
        verificationData: finalResult,
        errorMsg,
        url: finalResult.length
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

    // 6. Clean up memory
    documentHashData.length = 0;
    finalResult.length = 0;
    global.isVerifierScriptRunning = false;
    console.log("🔍 Memory usage:", process.memoryUsage());
    if (global.gc) global.gc();
  } catch (error) {
    console.log("💥 Fatal Error:", error);
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
    let data = localStorage.getItem("folderPath")
      ? JSON.parse(localStorage.getItem("folderPath"))
      : [];
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
          if (
            normalizedPath === path.endsWith("/") ? path.slice(0, -1) : path
          ) {
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
      labDocumentHashId: doc.labDocumentHashId,
      documentHashId: doc.documentHashId,
      OrganizationExhibitId: doc.OrganizationExhibitId,
      integrantId: doc.integrantId,
      labOrgName: doc.labOrgName,
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

// View document
exports.viewFile = (req, res) => {
  try {
    const filePath = req.query.path;

    if (!filePath) {
      return res.status(400).send("File path is required");
    }

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(400).send("File not found");
      }

      res.sendFile(filePath);
    });
  } catch (error) {
    res.status(200).json({
      status: "0",
      message: error.message,
    });
  }
};
