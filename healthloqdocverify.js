require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 7001;
const app = express();
const cors = require("cors");
const chokidar = require("chokidar");
const { LocalStorage } = require("node-localstorage");
global.localStorage = new LocalStorage("./scratch");

app.set("view engine", "ejs");

const {
  removeDeletedFilesFromFolder,
  readFolder,
  addNewFileIntoData,
  getData,
  getHealthLoqApiPayload,
  getFileNameFromFilePath,
  deleteFileFromData,
} = require("./utils");
const { syncHash } = require("./services/healthloq");
const watcher = chokidar.watch(process.env.ROOT_FOLDER_PATH, {
  persistent: true,
});

(async () => {
  global.data = await getData();
  const oldData = await getData();
  await removeDeletedFilesFromFolder();
  await readFolder();
  const newData = await getData();
  await syncHash(getHealthLoqApiPayload(oldData, newData));
  watcher.on("all", async (eventName, filePath, state = {}) => {
    if (["add", "unlink", "change"].includes(eventName)) {
      setTimeout(async () => {
        const oldData = await getData();
        if (["add", "change"].includes(eventName))
          await addNewFileIntoData(
            getFileNameFromFilePath(filePath),
            filePath,
            state,
            eventName
          );
        if (eventName === "unlink")
          await deleteFileFromData(getFileNameFromFilePath(filePath), filePath);
        const newData = await getData();
        await syncHash(getHealthLoqApiPayload(oldData, newData));
      }, 500);
    }
  });
})();

app.use(cors());
app.use("/dashboard", require("./routes/dashboard"));

app.listen(port, () =>
  console.log(
    `Check basic hash generation overview visit http://localhost:${port} url.`
  )
);
