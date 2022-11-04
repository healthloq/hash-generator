const moment = require("moment");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const jwt = require("jsonwebtoken");

/**
 *
 * @param {String} filePath
 * @returns
 */
exports.getFileNameFromFilePath = (filePath) => {
  return filePath.replace(/\\/g, "/").split("/").pop();
};

/**
 *
 * @param {Array} oldData
 * @param {Array} newData
 * @returns
 */
exports.getHealthLoqApiPayload = (oldData, newData) => {
  const oldDataHash = oldData?.map((item) => item.hash);
  const newDataHash = newData?.map((item) => item.hash);
  const hashList = newDataHash.filter((hash) => !oldDataHash.includes(hash));
  const deletedHashList = oldDataHash.filter(
    (hash) => !newDataHash.includes(hash)
  );
  return {
    hashList,
    deletedHashList,
  };
};

/**
 *
 * @returns
 */
exports.generateJwtToken = () =>
  jwt.sign(
    { organization_id: process.env.ORGANIZATION_ID },
    process.env.JWT_SECRET
  );

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
 * @param {String || Date} date
 * @returns
 */
exports.getDateWith12HourTimeFormate = (date) =>
  moment(date).format("MM/DD/YYYY hh:mm A");

/**
 *
 * @returns
 */
exports.getData = async () => {
  const data = localStorage.getItem("data");
  return data ? await JSON.parse(data) : [];
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
exports.deleteFileFromData = async (fileName, filePath) => {
  try {
    data = await data.filter(
      (item) => !(item?.fileName === fileName && item?.path === filePath)
    );
    this.setData(data);
    console.log(`=== ${fileName} file deleted from path ${filePath}.`);
  } catch (error) {}
};

/**
 *
 * @param {String} fileName
 * @param {String} filePath
 * @param {Object} state
 * @param {String} eventName
 * @returns
 */
exports.addNewFileIntoData = async (
  fileName,
  filePath,
  state = {},
  eventName = ""
) => {
  try {
    if (
      eventName === "change" &&
      data.filter(
        (item) => item.fileName === fileName && item.path === filePath
      ).length === 0
    )
      return;
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    if (
      data.filter(
        (item) =>
          item?.hash !== hash &&
          item?.fileName === fileName &&
          item.path === filePath
      ).length === 1
    ) {
      await this.deleteFileFromData(fileName, filePath);
    }
    if (
      data.length === 0 ||
      data.filter((item) => item?.hash === hash && item.path === filePath)
        .length === 0
    ) {
      data.push({
        fileName,
        hash,
        path: filePath,
        state,
        createdAt: new Date(),
      });
      this.setData(data);
      console.log(`=== ${fileName} hash generated`);
    }
  } catch (error) {
    await this.deleteFileFromData(fileName, filePath);
  }
};

exports.readFolder = async (folderPath = process.env.ROOT_FOLDER_PATH) => {
  try {
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    for (let item of files) {
      if (item.isFile()) {
        const filePath = path.join(folderPath, item.name);
        let state = {};
        try {
          state = fs.statSync(filePath);
        } catch (error) {}
        await this.addNewFileIntoData(item.name, filePath, state);
      } else {
        await this.readFolder(path.join(folderPath, item.name));
      }
    }
  } catch (error) {}
};

exports.removeDeletedFilesFromFolder = async () => {
  if (data.length) {
    for (let item of data) {
      try {
        fs.readFileSync(item.path);
      } catch (error) {
        data = data.filter((file) => file.hash !== item.hash);
      }
    }
    this.setData(data);
  }
};
