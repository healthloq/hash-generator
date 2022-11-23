const {
  sort,
  getDateWith12HourTimeFormate,
  getData,
  readFolder,
  removeDeletedFilesFromFolder,
  getFolderOverview,
} = require("../utils");
const { verifyDocument } = require("../services/healthloq");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

exports.getDashboardData = async (req, res) => {
  const data = await getData();
  res.status(200).json({
    status: "success",
    lastSyncedDate: sort("createdAt", data).reverse()[0]?.createdAt,
    totalFiles: data.length,
    files: sort("createdAt", data).reverse().slice(0, 5) || [],
  });
};

exports.renderHomePage = async (req, res) => {
  const data = await getData();
  const lastSyncedDate = getDateWith12HourTimeFormate(
    sort("createdAt", data).reverse()[0]?.createdAt
  );
  res.render("home", {
    lastSyncedDate,
    totalFiles: data.length,
    files:
      sort("createdAt", data)
        .reverse()
        .slice(0, 5)
        ?.map((item) => ({
          ...item,
          state: {
            ...item?.state,
            mtime: getDateWith12HourTimeFormate(item.state.mtime),
            birthtime: getDateWith12HourTimeFormate(item.state.birthtime),
          },
        })) || [],
    syncNow: async () => {
      await removeDeletedFilesFromFolder();
      await readFolder();
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

exports.verifyDocuments = async (req, res) => {
  let result = [];
  try {
    const { folderPath, organization_id } = req.body;
    const readDir = async (dirPath) => {
      let files = [];
      try {
        files = fs.readdirSync(dirPath, { withFileTypes: true });
      } catch (error) {
        result.push({
          fileName: "",
          filePath: "",
          isVerifiedDocument: null,
          message: "Folder not found.",
          folderPath: dirPath,
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
            console.log("HealthLOQ document verification response: ", response);
            if (response?.status === "1") {
              result.push({
                fileName: item.name,
                filePath,
                isVerifiedDocument: response?.data?.isVerifiedDocument,
                message: response?.message,
                folderPath: "",
              });
            } else {
              result.push({
                fileName: item.name,
                filePath,
                isVerifiedDocument: null,
                message: response?.message,
                folderPath: "",
              });
            }
            io.sockets.emit("documentVerificationUpdate", {
              fileName: item.name,
              filePath,
              verificationType: "end",
            });
          } catch (error) {
            result.push({
              fileName: item.name,
              filePath,
              isVerifiedDocument: null,
              message: "File not found.",
              folderPath: "",
            });
          }
        } else {
          await readDir(path.join(dirPath, item.name));
        }
      }
    };
    await readDir(folderPath);
    let response = {
      verifiedDocumentCount: result?.filter(
        (item) => item?.isVerifiedDocument === true
      )?.length,
      unVerifiedDocumentCount: result?.filter(
        (item) => item?.isVerifiedDocument === false
      )?.length,
    };
    res.status(200).json({
      status: "1",
      data: {
        ...response,
        errorsCount:
          result?.length -
          response.verifiedDocumentCount -
          response.unVerifiedDocumentCount,
        files: result,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(422).json({
      status: "0",
      message: "Something went wrong! please try after sometime.",
    });
  }
};
