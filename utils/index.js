const fs = require("fs");
const crypto = require("crypto");
const path = require("path");
const os = require("os");
const { ALLOWED_DOCUMENT_FILE_TYPES } = require("../constants");
const {
  syncHash,
  getSubscriptionDetail,
  syncDocToolLogs,
  publisherScriptIsRunningOrNot,
  // verifyDocumentFromAI,
} = require("../services/healthloq");
const moment = require("moment");
const notifier = require("node-notifier");
const packageJson = require("../package.json");
const OpenAI = require("openai");

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
exports.getData = async (fileName) => {
  let data = [];
  try {
    let tempData = await JSON.parse(
      localStorage.getItem(fileName ? fileName : "data")
    );
    if (tempData) data = Object.values(tempData);
  } catch (error) {}
  return data;
};

/**
 * This function return data in object format
 * @returns data
 */
exports.getDataInObjectFormat = async (fileName) => {
  let data = {};
  try {
    let tempData = await JSON.parse(
      localStorage.getItem(fileName ? fileName : "data")
    );
    if (tempData) data = tempData;
  } catch (error) {}
  return data;
};

/**
 *
 * @param {Array} data
 */
exports.setData = (data, fileName) =>
  localStorage.setItem(
    fileName ? fileName : "data",
    JSON.stringify(
      Object.fromEntries(data?.map((item) => [item?.state?.ino, item]))
    )
  );

exports.getFolderOverview = async (rootFolderPath) => {
  let unreadFolders = [];
  let unreadFiles = [];
  let filesCount = 0;
  let newFilesCount = 0;
  let errorMsg = "";
  let folderPath = "";
  try {
    const oldData = await this.getDataInObjectFormat(
      "documentVerificationData"
    );
    let foldersArr = [rootFolderPath];
    while (foldersArr?.length > 0) {
      folderPath = foldersArr?.pop();
      let files = [];
      try {
        files = fs.opendirSync(folderPath);
      } catch (error) {
        unreadFolders.push(folderPath);
      }
      if (Array.isArray(files) && !files?.length) {
        unreadFolders.push(folderPath);
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
          filesCount++;
          const filePath = path.join(folderPath, item.name);
          const state = fs.statSync(filePath);
          if (
            state &&
            (!oldData ||
              (Boolean(oldData) && !Boolean(oldData?.[state?.ino])) ||
              !moment(oldData?.[state?.ino]?.state?.mtime).isSame(
                moment(state?.mtime)
              ))
          )
            newFilesCount++;
        } else {
          foldersArr.push(path.join(folderPath, item.name));
        }
      }
    }
    return {
      errorMsg,
      filesCount,
      newFilesCount,
      unreadFiles,
      unreadFolders,
    };
  } catch (error) {
    unreadFolders.push(folderPath);
    return {
      errorMsg,
      filesCount,
      newFilesCount,
      unreadFiles,
      unreadFolders,
    };
  }
};

exports.verifyDocumentFromAI = async (file) => {
  try {
    const openaiClient = new OpenAI({
      apiKey: process.env.OPEN_AI_API_KEY || "",
    });
    const assistant = await openaiClient.beta.assistants.create({
      name: "Document Analyst Assistant",
      instructions:
        "You are exprt in analyzing the testing document from labs. Use your knowledge base to answer your question about document ",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
    });

    let file_buffer = Buffer.from(file.data);

    const temp_file_path = path.join(os.tmpdir(), "temp.pdf");
    fs.writeFileSync(temp_file_path, file_buffer);

    const aap110k = await openaiClient.files.create({
      file: fs.createReadStream(temp_file_path),
      purpose: "assistants",
    });

    const thread = await openaiClient.beta.threads.create({
      messages: [
        {
          role: "user",
          content: "Here is the document to analyze",
          attachments: [
            { file_id: aap110k.id, tools: [{ type: "file_search" }] },
          ],
        },
        {
          role: "assistant",
          content:
            "Extract an array of objects containing only the 'name' and 'status' for all substances that have a status indicating success or failure. Ensure the result is a single array, Return single array only",
        },
      ],
    });

    const run = await openaiClient.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });

    const messages = await openaiClient.beta.threads.messages.list(thread.id, {
      run_id: run.id,
    });

    const message = messages.data.pop();
    let jsonString = null;
    if (message?.content[0].type === "text") {
      const { text } = message.content[0];
      const { value } = text;
      try {
        jsonString = (value ?? "").match(/\[.*\]/s)?.[0];
      } catch (error) {
        jsonString = value;
      }
      if (jsonString === undefined || jsonString === null) {
        jsonString = value;
      } else {
        jsonString = JSON.parse(jsonString);
      }
    }
    const allContent = [
      "sildenafil",
      "tadalafil",
      "sibutramine",
      "phenolphthalein",
      "fluoxetine",
      "steroids",
      "dmaa",
      "ephedrine",
      "arsenic",
      "cadmium",
      "lead",
      "mercury",
      "chromium",
      "bile-tolerant gram-negative bacteria",
      "escherichia coli",
      "salmonella",
      "pseudomonas aeruginosa",
      "staphylococcus aureus",
      "clostridia",
      "candida albicans",
      "arsenic (as)",
      "cadmium (cd)",
      "lead (pb)",
      "mercury (methyl mercury)",
      "mercury (hg)",
      "chromium (chromium vi)",
      "dmaa (1,3-dimethylamylamine)",
      "ephedrine, or sarms (selective androgen receptor modulators)",
    ];

    let finalArr = [];
    if (Array.isArray(jsonString)) {
      jsonString
        .filter((data) => data.status.toLowerCase() !== "passed")
        .map((substance) => {
          if (allContent.includes(substance.name.trim().toLowerCase())) {
            finalArr.push(substance.name);
          }
        });
    }

    return {
      status: 1,
      finalArr,
    };
  } catch (error) {
    console.log("error", error);
    throw new Error("Something went wrong");
  }
};

exports.generateHashForVerifier = async (
  rootFolderPath = process.env.ROOT_FOLDER_PATH
) => {
  let arr = [];
  let unreadFolders = [];
  let unreadFiles = [];
  let folderPath = "";
  try {
    const oldData = await this.getDataInObjectFormat(
      "documentVerificationData"
    );
    let foldersArr = [rootFolderPath];
    while (foldersArr?.length > 0) {
      folderPath = foldersArr?.pop();
      let files = [];
      try {
        files = fs.opendirSync(folderPath);
      } catch (error) {
        unreadFolders.push(folderPath);
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
        unreadFolders.push(folderPath);
        notifier.notify({
          title: "HealthLOQ - Doc Tool Warning",
          message: `Something went wrong! We are not able to read the directory ${folderPath}. so, we are skipping that folder.`,
          sound: true,
        });
        syncDocToolLogs({
          message: `generateHashForVerifier => We are not able to read the directory ${folderPath}`,
          error_message: `generateHashForVerifier => We are not able to read the directory ${folderPath}`,
          error: null,
        });
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
          let state = null;
          try {
            state = fs.statSync(filePath);
            if (
              state &&
              Boolean(oldData) &&
              Boolean(oldData?.[state?.ino]) &&
              moment(oldData?.[state?.ino]?.state?.mtime).isSame(
                moment(state?.mtime)
              )
            )
              continue;
          } catch (error) {
            unreadFiles.push(filePath);
            continue;
          }
          let fileBuffer = null;
          try {
            fileBuffer = fs.readFileSync(filePath);
          } catch (error) {
            unreadFiles.push(filePath);
            continue;
          }
          const hash = crypto
            .createHash("sha256")
            .update(fileBuffer)
            .digest("hex");
          let openAiResult = null;
          if (process.env.OPEN_AI_API_KEY) {
            try {
              const temp = await this.verifyDocumentFromAI({
                data: fileBuffer,
              });
              openAiResult = temp.finalArr;
            } catch (error) {
              openAiResult = ["Not able to read data"];
              console.log("error", error);
            }
          }
          arr.push({
            fileName: item.name,
            hash,
            openAiResult,
            path: filePath,
            state,
            createdAt: new Date(),
          });
        } else {
          foldersArr.push(path.join(folderPath, item.name));
        }
      }
    }
    return {
      data: arr,
      unreadFiles,
      unreadFolders,
    };
  } catch (error) {
    unreadFolders.push(folderPath);
    console.log("generateHashForVerifier => ", error);
    notifier.notify({
      title: "HealthLOQ - Doc Tool Error",
      message: `Something went wrong! We are trying to read directory ${folderPath}`,
      sound: true,
    });
    syncDocToolLogs({
      message: `generateHashForVerifier => Something went wrong! We are trying to read directory ${folderPath}`,
      error_message: error?.message,
      error,
    });
    return {
      data: arr,
      unreadFiles,
      unreadFolders,
    };
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
  rootFolderPath = process.env.ROOT_FOLDER_PATH
) => {
  let arr = [];
  let count = 0;
  let hasMoreFiles = false;
  let folderPath = "";
  try {
    let oldData = await this.getDataInObjectFormat();
    let foldersArr = [rootFolderPath];
    while (foldersArr?.length > 0 && arr?.length < 500) {
      folderPath = foldersArr?.pop();
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
        notifier.notify({
          title: "HealthLOQ - Doc Tool Warning",
          message: `Something went wrong! We are not able to read the directory ${folderPath}. so, we are skipping that folder and reading again after some time.`,
          sound: true,
        });
        syncDocToolLogs({
          message: `generateHashForPublisher => We are not able to read the directory ${folderPath}`,
          error_message: `generateHashForPublisher => We are not able to read the directory ${folderPath}`,
          error: null,
        });
      }
      let lastSyncedFile = localStorage.getItem("lastSyncedFile");
      for await (const item of files) {
        if (arr?.length === 500) {
          hasMoreFiles = true;
          break;
        }
        if (item.isFile()) {
          count++;
          if (
            item?.name
              ?.split(".")
              ?.pop()
              ?.toLowerCase()
              ?.match(ALLOWED_DOCUMENT_FILE_TYPES) === null
          )
            continue;
          // if (lastSyncedFile) {
          //   if (item?.name === lastSyncedFile) lastSyncedFile = null;
          //   continue;
          // }
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
            effective_date: moment("9999-12-31", "YYYY-MM-DD"),
          });
          if (arr?.length === 500) {
            lastSyncedFile = item?.name;
          }
        } else {
          foldersArr.push(path.join(folderPath, item.name));
        }
      }
    }
    return {
      data: arr,
      hasMoreFiles,
      count,
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
      count,
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
      syncDocToolLogs({
        message: `getSyncData => Something went wrong! Publisher subscription not found.`,
        error_message:
          "Something went wrong! Publisher subscription not found.",
        error: null,
      });
      notifier.notify({
        title: "HealthLOQ - Doc Tool Error",
        message: `Something went wrong! Publisher subscription not found. Please check whether the subscription is active or not.`,
        sound: true,
      });
      return;
    }
    let hashLimit = subscriptionData?.num_monthly_hashes || "0";
    let todayHashLimit = subscriptionData?.current_num_monthly_hashes || "0";
    // bypass if admin set ignore_threshold value
    if (
      !(
        subscriptionData &&
        subscriptionData?.organization &&
        subscriptionData?.organization?.ignore_threshold > 0
      )
    ) {
      if (!hashLimit || !todayHashLimit) {
        global.isGetSyncDataProcessStart = false;
        syncDocToolLogs({
          message: `getSyncData => Something went wrong! Invalid subscription information.`,
          error_message:
            "Something went wrong! Invalid subscription information.",
          error: null,
        });
        notifier.notify({
          title: "HealthLOQ - Doc Tool Error",
          message: `Something went wrong! Invalid Subscription Information.`,
          sound: true,
        });
        return;
      }
      hashLimit = parseInt(hashLimit);
      todayHashLimit = parseInt(todayHashLimit);
      if (hashLimit <= todayHashLimit) {
        global.isGetSyncDataProcessStart = false;
        syncDocToolLogs({
          message: `getSyncData => Your monthly document upload limit is exceeded. So, We will try again on the next month after the limit is reset.`,
          error_message:
            "Your monthly document upload limit is exceeded. So, We will try again on the next month after the limit is reset.",
          error: null,
        });
        notifier.notify({
          title: "HealthLOQ - Doc Tool Error",
          message: `Your monthly document upload limit is exceeded. So, We will try again on the next month after the limit is reset.`,
          sound: true,
        });
        return;
      }
    }
    if (!syncedData) {
      syncedData = await this.getData();
    }
    const {
      data: latestData,
      hasMoreFiles,
      count,
    } = await this.generateHashForPublisher(process.env.ROOT_FOLDER_PATH);
    const syncedhash = syncedData?.map((item) => item?.hash);
    const latestHash = latestData?.map((item) => item?.hash);
    // const deletedHashList = syncedhash?.filter(
    //   (hash) => !latestHash?.includes(hash)
    // );
    const deletedHashList = [];
    let hashList = latestHash?.filter((hash) => !syncedhash?.includes(hash));
    if (
      subscriptionData?.organization?.ignore_threshold === 0 ||
      !subscriptionData?.organization?.ignore_threshold
    ) {
      if (todayHashLimit + hashList?.length > hashLimit) {
        const extraDocLength = todayHashLimit + hashList?.length - hashLimit;
        hashList = hashList?.slice(0, hashList?.length - extraDocLength);
      }
    }
    let newData = syncedData?.concat(latestData || []);
    let syncStatus = null;
    if (hashList?.length || deletedHashList?.length) {
      syncStatus = await syncHash({
        deletedHashList,
        hashList,
        hashCount: todayHashLimit + hashList?.length,
      });
      if (syncStatus === "1") {
        // ?.filter((item) => {
        //   deletedHashList?.includes(item?.hash) &&
        //     console.log(
        //       `=== ${item?.fileName} file deleted from path ${item?.path}`
        //     );
        //   return !deletedHashList?.includes(item?.hash);
        // })
        for (let item of latestData) {
          if (hashList?.includes(item?.hash)) {
            console.log(`=== ${item?.fileName} hash generated`);
          }
        }
        this.setData(newData);
        global.subscriptionDetail = subscriptionDetail?.map((item) =>
          item?.subscription_type === "publisher"
            ? {
                ...item,
                current_num_monthly_hashes: String(
                  todayHashLimit + hashList?.length
                ),
              }
            : item
        );
      }
    }
    publisherScriptIsRunningOrNot({
      is_running: hasMoreFiles,
      todayHashLimit: todayHashLimit,
      syncedData: syncedData?.length,
      hashList: hashList?.length,
      newData: newData?.length,
      deletedHashList: deletedHashList?.length,
      latestData: latestData?.length,
      lastSyncedFile: latestData?.[latestData?.length - 1]?.fileName,
      count,
    });
    if (hasMoreFiles && syncStatus !== "0") {
      localStorage.setItem(
        "lastSyncedFile",
        latestData?.[latestData?.length - 1]?.fileName
      );
      this.getSyncData(newData);
    } else {
      localStorage.removeItem("lastSyncedFile");
      global.isGetSyncDataProcessStart = false;
      localStorage.setItem(
        "staticData",
        JSON.stringify({
          lastSyncedDate: new Date(),
        })
      );
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
    publisherScriptIsRunningOrNot({
      is_running: global.isGetSyncDataProcessStart,
      doc_tool_version: packageJson.version,
    });
  }, 5 * 60 * 1000); // 5 min
};

exports.filterObj = (obj, keys) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => !keys.includes(key))
  );

// function for set folderPath in array

exports.setFolderPathToArray = (folderPath) => {
  let array = JSON.parse(localStorage.getItem("folderPath")) || [];
  if (!array.includes(folderPath.trim())) {
    array.push(folderPath);

    localStorage.setItem("folderPath", JSON.stringify(array));
  }
};
