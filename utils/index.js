const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { ALLOWED_DOCUMENT_FILE_TYPES } = require("../constants");
const { syncHash, getSubscriptionDetail } = require("../services/healthloq");

/**
 *
 * @param {String} filePath
 * @returns
 */
// exports.getFileNameFromFilePath = (filePath) => {
//   return filePath.replace(/\\/g, "/").split("/").pop();
// };

/**
 *
 * @param {Array} oldData
 * @param {Array} newData
 * @returns
 */
// exports.getHealthLoqApiPayload = (oldData, newData) => {
//   const oldDataHash = oldData?.map((item) => item.hash);
//   const newDataHash = newData?.map((item) => item.hash);
//   const hashList = newDataHash.filter((hash) => !oldDataHash.includes(hash));
//   const deletedHashList = oldDataHash.filter(
//     (hash) => !newDataHash.includes(hash)
//   );
//   return {
//     hashList,
//     deletedHashList,
//   };
// };

/**
 *
 * @param {String} prop
 * @param {Array} arr
 * @returns
 */
exports.sort = (prop, arr) => {
  prop = prop.split(".");
  let len = prop.length;

  arr.sort(function (a, b) {
    var i = 0;
    while (i < len) {
      a = a[prop[i]];
      b = b[prop[i]];
      i++;
    }
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  });
  return arr;
};

/**
 *
 * @returns
 */
exports.getData = async () => {
  let data = [];
  try {
    let tempData = await JSON.parse(localStorage.getItem("data"));
    if (tempData?.length) data = tempData;
  } catch (error) {}
  return data;
};

/**
 *
 * @param {Array} data
 */
exports.setData = (data) => localStorage.setItem("data", JSON.stringify(data));

/**
 *
 * @param {String} fileName
 * @param {String} filePath
 */
// exports.deleteFileFromData = async (fileName, filePath) => {
//   try {
//     if (
//       fileName.split(".").pop()?.match(ALLOWED_DOCUMENT_FILE_TYPES) !== null
//     ) {
//       data = await data.filter(
//         (item) => !(item?.fileName === fileName && item?.path === filePath)
//       );
//       this.setData(data);
//       console.log(`=== ${fileName} file deleted from path ${filePath}.`);
//     }
//   } catch (error) {}
// };

/**
 *
 * @param {String} fileName
 * @param {String} filePath
 * @param {Object} state
 * @param {String} eventName
 * @returns
 */
// exports.addNewFileIntoData = async (
//   fileName,
//   filePath,
//   state = {},
//   eventName = ""
// ) => {
//   try {
//     if (
//       fileName.split(".").pop()?.match(ALLOWED_DOCUMENT_FILE_TYPES) !== null
//     ) {
//       if (
//         eventName === "change" &&
//         data.filter(
//           (item) => item.fileName === fileName && item.path === filePath
//         ).length === 0
//       )
//         return;
//       const fileBuffer = fs.readFileSync(filePath);
//       const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
//       if (
//         data.filter(
//           (item) =>
//             item?.hash !== hash &&
//             item?.fileName === fileName &&
//             item.path === filePath
//         ).length === 1
//       ) {
//         await this.deleteFileFromData(fileName, filePath);
//       }
//       const hashLimit =
//         subscriptionDetail?.filter(
//           (item) => item?.subscription_type === "publisher"
//         )[0]?.num_daily_hashes || null;
//       if (
//         data.length === 0 ||
//         (data.filter((item) => item?.hash === hash && item.path === filePath)
//           .length === 0 &&
//           hashLimit &&
//           data?.length < parseInt(hashLimit))
//       ) {
//         data.push({
//           fileName,
//           hash,
//           path: filePath,
//           state,
//           createdAt: new Date(),
//         });
//         this.setData(data);
//         console.log(`=== ${fileName} hash generated`);
//       } else {
//         return;
//       }
//     }
//   } catch (error) {
//     await this.deleteFileFromData(fileName, filePath);
//   }
// };

// exports.readFolder = async (folderPath = process.env.ROOT_FOLDER_PATH) => {
//   try {
//     const files = fs.readdirSync(folderPath, { withFileTypes: true });
//     for (let item of files) {
//       if (item.isFile()) {
//         const filePath = path.join(folderPath, item.name);
//         let state = {};
//         try {
//           state = fs.statSync(filePath);
//         } catch (error) {}
//         await this.addNewFileIntoData(item.name, filePath, state);
//       } else {
//         await this.readFolder(path.join(folderPath, item.name));
//       }
//     }
//   } catch (error) {
//     fs.mkdirSync(folderPath);
//   }
// };

// exports.removeDeletedFilesFromFolder = async () => {
//   if (data.length) {
//     for (let item of data) {
//       try {
//         fs.readFileSync(item.path);
//       } catch (error) {
//         data = data.filter((file) => file.hash !== item.hash);
//       }
//     }
//     this.setData(data);
//   }
// };

exports.getFolderOverview = async (folderPath, result = {}) => {
  let files = [];
  if (!result?.errorMsg) result["errorMsg"] = "";
  if (!result?.filesCount) result["filesCount"] = 0;
  try {
    files = fs.readdirSync(folderPath, { withFileTypes: true });
  } catch (error) {
    result[
      "errorMsg"
    ] = `Invalid folder name. we are not able to get any folder on ${folderPath} this path.`;
    return result;
  }
  for (let item of files) {
    if (item.isFile()) {
      result["filesCount"] = result?.filesCount + 1;
    } else {
      await this.getFolderOverview(path.join(folderPath, item.name), result);
    }
    if (result?.filesCount > 2000) {
      result["errorMsg"] = `You can't sync more than 2000 files at a time.`;
      break;
    }
  }
  return result;
};

exports.generateHash = async (
  folderPath = process.env.ROOT_FOLDER_PATH,
  arr = []
) => {
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    for (let item of files) {
      if (item.isFile()) {
        if (
          item?.name?.split(".").pop()?.match(ALLOWED_DOCUMENT_FILE_TYPES) !==
          null
        ) {
          const filePath = path.join(folderPath, item.name);
          let state = {};
          try {
            state = fs.statSync(filePath);
          } catch (error) {}
          const fileBuffer = fs.readFileSync(filePath);
          const hash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");
          arr.push({
            fileName: item.name,
            hash,
            path: filePath,
            state,
            createdAt: new Date(),
          });
        }
      } else {
        await this.generateHash(path.join(folderPath, item.name), arr);
      }
    }
    return arr;
  } catch (error) {
    fs.mkdirSync(folderPath);
    return arr;
  }
};

exports.getSyncData = async () => {
  const syncedData = await this.getData();
  const latestData = await this.generateHash();
  const syncedhash = syncedData?.map((item) => item?.hash);
  const latestHash = latestData?.map((item) => item?.hash);
  const deletedHashList = syncedhash?.filter(
    (hash) => !latestHash?.includes(hash)
  );
  let hashList = latestHash?.filter((hash) => !syncedhash?.includes(hash));
  const subscriptionData =
    subscriptionDetail?.filter(
      (item) => item?.subscription_type === "publisher"
    )[0] || null;
  let hashLimit = 30 || subscriptionData?.num_daily_hashes;
  let todayHashLimit = subscriptionData?.current_num_daily_hashes;
  if (hashLimit && todayHashLimit) {
    hashLimit = parseInt(hashLimit);
    todayHashLimit = parseInt(todayHashLimit);
    if (
      todayHashLimit - deletedHashList?.length + hashList?.length <=
      hashLimit
    ) {
      let newData = syncedData
        ?.filter((item) => {
          deletedHashList?.includes(item?.hash) &&
            console.log(
              `=== ${item?.fileName} file deleted from path ${item?.path}`
            );
          return !deletedHashList?.includes(item?.hash);
        })
        .concat(
          latestData?.filter((item) => {
            hashList?.includes(item?.hash) &&
              console.log(`=== ${item?.fileName} hash generated`);
            return hashList?.includes(item?.hash);
          })
        );
      this.setData(newData);

      return {
        deletedHashList,
        hashList,
        hashCount: newData?.length,
      };
    } else {
      const extraDocLength =
        todayHashLimit - deletedHashList?.length + hashList?.length - hashLimit;
      hashList = hashList?.slice(0, hashList?.length - extraDocLength);
      let newData = syncedData
        ?.filter((item) => {
          deletedHashList?.includes(item?.hash) &&
            console.log(
              `=== ${item?.fileName} file deleted from path ${item?.path}`
            );
          return !deletedHashList?.includes(item?.hash);
        })
        .concat(
          latestData?.filter((item) => {
            hashList?.includes(item?.hash) &&
              console.log(`=== ${item?.fileName} hash generated`);
            return hashList?.includes(item?.hash);
          })
        );
      this.setData(newData);
      return {
        deletedHashList,
        hashList,
        hashCount: newData?.length,
      };
    }
  } else {
    return {
      deletedHashList: [],
      hashList: [],
      hashCount: 0,
    };
  }
};

exports.setDocumentSyncTimeout = () => {
  if (global.documentSyncTimeout) {
    clearTimeout(global.documentSyncTimeout);
  }
  global.documentSyncTimeout = setTimeout(async () => {
    this.setDocumentSyncInterval();
    const subscriptionDetail = await getSubscriptionDetail();
    global.subscriptionDetail = subscriptionDetail?.data;
    const syncData = await this.getSyncData();
    await syncHash(syncData);
  }, 0.1 * 60 * 1000); // 10 Sec
};

exports.setDocumentSyncInterval = () => {
  if (global.documentSyncInterval) {
    clearInterval(global.documentSyncInterval);
  }
  global.documentSyncInterval = setInterval(async () => {
    const subscriptionDetail = await getSubscriptionDetail();
    global.subscriptionDetail = subscriptionDetail?.data;
    const syncData = await this.getSyncData();
    await syncHash(syncData);
  }, 10 * 60 * 1000); // 10 min
};
