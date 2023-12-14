const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const { ALLOWED_DOCUMENT_FILE_TYPES } = require("../constants");
const { syncHash, getSubscriptionDetail } = require("../services/healthloq");
const moment = require("moment");

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
    const files = fs.opendirSync(folderPath);
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
    console.log("generateHashForVerifier", error);
    fs.mkdirSync(folderPath);
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
  try {
    const files = fs.opendirSync(folderPath);
    let hasMoreFiles = false;
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
    console.log("generateHashForPublisher", error);
    fs.mkdirSync(folderPath);
    return {
      data: arr,
      hasMoreFiles,
    };
  }
};

exports.getSyncData = async (syncedData = null) => {
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
  if (hashList?.length || deletedHashList?.length) {
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
            return hashList?.includes(item?.hash);
          })
        );
      this.setData(newData);
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
      await this.getSyncData();
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
      await this.getSyncData();
    }
  }, 5 * 60 * 1000); // 5 min
};

exports.filterObj = (obj, keys) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => !keys.includes(key))
  );
