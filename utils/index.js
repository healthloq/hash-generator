const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { ALLOWED_DOCUMENT_FILE_TYPES } = require("../constants");
const {
  syncHash,
  getSubscriptionDetail,
  syncDocToolLogs,
} = require("../services/healthloq");
const moment = require("moment");
const notifier = require("node-notifier");

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
 * This function return data in array format
 * @returns data
 */
exports.getData = async () => {
  let data = [];
  try {
    let tempData = await JSON.parse(localStorage.getItem("data"));
    if (tempData) data = Object.values(tempData);
  } catch (error) {}
  return data;
};

/**
 * This function return data in object format
 * @returns data
 */
exports.getDataInObjectFormat = async () => {
  let data = {};
  try {
    let tempData = await JSON.parse(localStorage.getItem("data"));
    if (tempData) data = tempData;
  } catch (error) {}
  return data;
};

/**
 *
 * @param {Array} data
 */
exports.setData = (data) =>
  localStorage.setItem(
    "data",
    JSON.stringify(
      Object.fromEntries(data?.map((item) => [item?.state?.ino, item]))
    )
  );

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

exports.generateHashForVerifier = async (
  folderPath = process.env.ROOT_FOLDER_PATH,
  arr = []
) => {
  try {
    let files = [];
    try {
      files = fs.opendirSync(folderPath);
    } catch (error) {
      console.log("generateHashForVerifier => ", error);
      notifier.notify({
        title: "HealthLOQ - Doc Tool Warning",
        message: `Something went wrong! We are not able to read the directory ${folderPath}. so, we are skipping that folder.`,
        sound: true,
      });
      syncDocToolLogs({
        message: `generateHashForVerifier => We are not able to read the directory ${folderPath}`,
        error_message: error?.message,
        error,
      });
    }
    if (Array.isArray(files) && !files?.length) {
      return arr;
    }
    for await (const item of files) {
      if (item.isFile()) {
        if (
          item?.name
            ?.split(".")
            ?.pop()
            ?.toLowerCase()
            ?.match(ALLOWED_DOCUMENT_FILE_TYPES) === null
        )
          continue;
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
      } else {
        await this.generateHashForVerifier(
          path.join(folderPath, item.name),
          arr
        );
      }
    }
    return arr;
  } catch (error) {
    console.log("generateHashForVerifier => ", error);
    notifier.notify({
      title: "HealthLOQ - Doc Tool Error",
      message: `Something went wrong! We are trying to read directory ${folderPath}`,
      sound: true,
    });
    syncDocToolLogs({
      message: `generateHashForVerifier => We are trying to read directory ${folderPath}`,
      error_message: error?.message,
      error,
    });
    return arr;
  }
};

exports.generateHashFromFileName = (filePath = "", file) => {
  let state = fs.statSync(filePath);
  let fileBuffer = fs.readFileSync(filePath);
  let hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return {
    fileName: file.name,
    hash,
    path: filePath,
    state,
    createdAt: new Date(),
  };
};

exports.generateHashForPublisher = async (
  folderPath = process.env.ROOT_FOLDER_PATH,
  arr = []
) => {
  let hasMoreFiles = false;
  try {
    let files = [];
    try {
      files = fs.opendirSync(folderPath);
    } catch (error) {
      console.log("generateHashForPublisher => ", error);
      notifier.notify({
        title: "HealthLOQ - Doc Tool Warning",
        message: `Something went wrong! We are not able to read the directory ${folderPath}. so, we are skipping that folder and reading again after some time.`,
        sound: true,
      });
      syncDocToolLogs({
        message: `generateHashForPublisher => We are not able to read the directory ${folderPath}`,
        error_message: error?.message,
        error,
      });
    }
    if (Array.isArray(files) && !files?.length) {
      return {
        data: arr,
        hasMoreFiles,
      };
    }
    let lastSyncedFile = localStorage.getItem("lastSyncedFile");
    let oldData = await this.getDataInObjectFormat();
    // let promise = [];
    for await (const item of files) {
      if (arr?.length === 500) {
        hasMoreFiles = true;
        break;
      }
      if (item.isFile()) {
        if (
          item?.name
            ?.split(".")
            ?.pop()
            ?.toLowerCase()
            ?.match(ALLOWED_DOCUMENT_FILE_TYPES) === null
        )
          continue;
        if (lastSyncedFile) {
          if (item?.name === lastSyncedFile) lastSyncedFile = null;
          continue;
        }
        const filePath = path.join(folderPath, item.name);
        let state = fs.statSync(filePath);
        if (
          state &&
          Boolean(oldData) &&
          Boolean(oldData?.[state?.ino]) &&
          moment(oldData?.[state?.ino]?.state?.mtime).isSame(
            moment(state?.mtime)
          )
        )
          continue;
        // promise.push({
        //   filePath: path.join(folderPath, item.name),
        //   file: item,
        // });
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
        if (arr?.length === 500) {
          lastSyncedFile = item?.name;
        }
      } else {
        await this.generateHashForPublisher(
          path.join(folderPath, item.name),
          arr
        );
      }
    }
    // arr = await Promise.all(
    //   promise?.map((item) =>
    //     this.generateHashFromFileName(item?.filePath, item?.file)
    //   )
    // );
    return {
      data: arr,
      hasMoreFiles,
    };
  } catch (error) {
    console.log("generateHashForPublisher => ", error);
    notifier.notify({
      title: "HealthLOQ - Doc Tool Error",
      message: `Something went wrong! We are trying to read directory ${folderPath}`,
      sound: true,
    });
    syncDocToolLogs({
      message: `generateHashForPublisher => Something went wrong! We are trying to read directory ${folderPath}`,
      error_message: error?.message,
      error,
    });
    return {
      data: arr,
      hasMoreFiles,
    };
  }
};

exports.getSyncData = async (syncedData = null) => {
  try {
    global.isGetSyncDataProcessStart = true;
    const subscriptionData =
      subscriptionDetail?.filter(
        (item) => item?.subscription_type === "publisher"
      )[0] || null;
    if (!subscriptionData || !Object.keys(subscriptionData).length) {
      global.isGetSyncDataProcessStart = false;
      return;
    }
    let hashLimit = subscriptionData?.num_daily_hashes;
    let todayHashLimit = subscriptionData?.current_num_daily_hashes;
    if (!hashLimit || !todayHashLimit) {
      global.isGetSyncDataProcessStart = false;
      return;
    }
    if (!syncedData) {
      syncedData = await this.getData();
    }
    const { data: latestData, hasMoreFiles } =
      await this.generateHashForPublisher(process.env.ROOT_FOLDER_PATH, []);
    const syncedhash = syncedData?.map((item) => item?.hash);
    const latestHash = latestData?.map((item) => item?.hash);
    // const deletedHashList = syncedhash?.filter(
    //   (hash) => !latestHash?.includes(hash)
    // );
    const deletedHashList = [];
    let hashList = latestHash?.filter((hash) => !syncedhash?.includes(hash));
    hashLimit = parseInt(hashLimit);
    todayHashLimit = parseInt(todayHashLimit);
    if (todayHashLimit + hashList?.length > hashLimit) {
      const extraDocLength = todayHashLimit + hashList?.length - hashLimit;
      hashList = hashList?.slice(0, hashList?.length - extraDocLength);
    }
    let newData = [];
    if (hashList?.length || deletedHashList?.length || true) {
      let syncStatus = await syncHash({
        deletedHashList,
        hashList,
        hashCount: todayHashLimit + hashList?.length,
      });
      if (syncStatus === "1") {
        newData = syncedData
          // ?.filter((item) => {
          //   deletedHashList?.includes(item?.hash) &&
          //     console.log(
          //       `=== ${item?.fileName} file deleted from path ${item?.path}`
          //     );
          //   return !deletedHashList?.includes(item?.hash);
          // })
          .concat(
            latestData?.filter((item) => {
              hashList?.includes(item?.hash) &&
                console.log(`=== ${item?.fileName} hash generated`);
              // return hashList?.includes(item?.hash);
              return true;
            })
          );
        this.setData(newData);
        console.log(newData?.length);
        if (hasMoreFiles) {
          global.subscriptionDetail = subscriptionDetail?.map((item) =>
            item?.subscription_type === "publisher"
              ? {
                  ...item,
                  current_num_daily_hashes: String(
                    todayHashLimit + hashList?.length
                  ),
                }
              : item
          );
          localStorage.setItem("lastSyncedFile", newData?.at(-1)?.fileName);
        } else {
          localStorage.removeItem("lastSyncedFile");
        }
      }
    }
    if (hasMoreFiles) {
      this.getSyncData(newData);
    } else {
      global.isGetSyncDataProcessStart = false;
    }
  } catch (error) {
    console.log("getSyncData => ", error);
    syncDocToolLogs({
      message: `getSyncData => Something went wrong!`,
      error_message: error?.message,
      error,
    });
    notifier.notify({
      title: "HealthLOQ - Doc Tool Error",
      message: `Something went wrong! We will re-try after some time.`,
      sound: true,
    });
  }
};

exports.setDocumentSyncTimeout = () => {
  if (global.documentSyncTimeout) {
    clearTimeout(global.documentSyncTimeout);
    if (global.documentSyncInterval) {
      clearInterval(global.documentSyncInterval);
    }
  }
  global.documentSyncTimeout = setTimeout(async () => {
    if (!global.isGetSyncDataProcessStart) {
      this.getSyncData();
    }
    this.setDocumentSyncInterval();
  }, 0.1 * 60 * 1000); // 10 Sec
};

exports.setDocumentSyncInterval = () => {
  if (global.documentSyncInterval) {
    clearInterval(global.documentSyncInterval);
  }
  global.documentSyncInterval = setInterval(async () => {
    if (!global.isGetSyncDataProcessStart) {
      let subscriptionInfo = await getSubscriptionDetail();
      global.subscriptionDetail = subscriptionInfo?.data;
      this.getSyncData();
    }
  }, 5 * 60 * 1000); // 5 min
};

exports.filterObj = (obj, keys) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => !keys.includes(key))
  );
