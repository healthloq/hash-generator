const { sort, getData, getFolderOverview } = require("../utils");
const {
  verifyDocument,
  getSubscriptionDetail,
} = require("../services/healthloq");
const fs = require("fs");
const crypto = require("crypto");
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
    const { folderPath, organization_id } = req.body;
    res.status(200).json({
      status: "1",
      data: [],
    });
    let verificationData = [];
    let errorMsg = "";
    const readDir = async (dirPath) => {
      let files = [];
      try {
        files = fs.readdirSync(dirPath, { withFileTypes: true });
      } catch (error) {
        verificationData.push({
          "File Name": "",
          "File Path": "",
          "Is Verified Document": null,
          Created: null,
          Message: "",
          "Error Message": `Something went wrong! We are not able to scan folder which located in this location ${dirPath}`,
        });
      }
      for (let item of files) {
        if (item.isFile()) {
          const filePath = path.join(dirPath, item.name);
          io.sockets.emit("documentVerificationUpdate", {
            fileName: item.name,
            filePath,
            verificationType: "start",
          });
          let state = {};
          try {
            state = fs.statSync(filePath);
            const fileBuffer = fs.readFileSync(filePath);
            const hash = crypto
              .createHash("sha256")
              .update(fileBuffer)
              .digest("hex");
            const response = await verifyDocument({ hash, organization_id });
            if (response?.status === "1") {
              verificationData.push({
                "File Name": item.name,
                "File Path": filePath,
                "Is Verified Document": response?.data?.isVerifiedDocument,
                Created: response?.data?.created_on
                  ? moment(response?.data?.created_on).format(
                      "DD MMMM, YYYY hh:mm A"
                    )
                  : null,
                Message: response?.message,
                "Error Message": "",
              });
            } else if (response?.status === "2") {
              errorMsg = response?.message;
              return;
            } else {
              verificationData.push({
                "File Name": item.name,
                "File Path": filePath,
                "Is Verified Document": null,
                Created: null,
                Message: "",
                "Error Message": `Something went wrong! We are not able to verify the file which located in this location ${filePath}.`,
              });
            }
            io.sockets.emit("documentVerificationUpdate", {
              fileName: item.name,
              filePath,
              verificationType: "end",
            });
          } catch (error) {
            verificationData.push({
              "File Name": item.name,
              "File Path": filePath,
              "Is Verified Document": null,
              Created: null,
              Message: "",
              "Error Message": `Something went wrong! We are not able to scan file which located in this location ${filePath}`,
            });
          }
        } else {
          await readDir(path.join(dirPath, item.name));
        }
      }
    };
    await readDir(folderPath);
    if (verificationData?.length) {
      const csv = json2csv(verificationData);
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
      noOfVerifiedDocuments: verificationData?.filter(
        (item) => item["Is Verified Document"] === "Yes"
      )?.length,
      noOfUnverifiedDocuments: verificationData?.filter(
        (item) => item["Is Verified Document"] === "No"
      )?.length,
      noOfErrors: verificationData?.filter((item) => item["Error Message"])
        .length,
      verificationData,
      errorMsg,
      url: verificationData?.length
        ? `${process.env.REACT_APP_API_BASE_URL}/public/exports/document-verification-overview.csv`
        : null,
      isDocVerificationFinalOverview: true,
    });
  } catch (error) {
    console.log(error);
  }
};
