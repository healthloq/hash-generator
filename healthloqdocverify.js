require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 7001;
const app = express();
const cors = require("cors");
const path = require("path");
const chokidar = require("chokidar");
const { LocalStorage } = require("node-localstorage");
global.localStorage = new LocalStorage("./scratch");
const server = require("http").createServer(app);

const {
  removeDeletedFilesFromFolder,
  readFolder,
  addNewFileIntoData,
  getData,
  getHealthLoqApiPayload,
  getFileNameFromFilePath,
  deleteFileFromData,
} = require("./utils");
const { syncHash, getSubscriptionDetail } = require("./services/healthloq");
const watcher = chokidar.watch(process.env.ROOT_FOLDER_PATH, {
  persistent: true,
});

module.exports = io = require("socket.io")(server);

io.on("connection", (socket) => {
  app.socket = socket;

  socket.on("disconnect", () => {});
});

(async () => {
  const subscriptionDetail = await getSubscriptionDetail();
  global.subscriptionDetail = subscriptionDetail?.data;
  if (
    subscriptionDetail?.data?.filter(
      (item) => item?.subscription_type === "publisher"
    )?.length
  ) {
    global.data = await getData();
    const oldData = await getData();
    await removeDeletedFilesFromFolder();
    await readFolder();
    const newData = await getData();
    await syncHash({
      ...getHealthLoqApiPayload(oldData, newData),
      hashCount: newData.length,
    });
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
            await deleteFileFromData(
              getFileNameFromFilePath(filePath),
              filePath
            );
          const newData = await getData();
          await syncHash({
            ...getHealthLoqApiPayload(oldData, newData),
            hashCount: newData.length,
          });
        }, 500);
      }
    });
  }
})();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/public", express.static(path.join(__dirname, "./public")));
app.use("/api/client", require("./routes/client"));

app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client/build/index.html"));
});

server.listen(port, () =>
  console.log(
    `Check basic hash generation overview visit http://localhost:${port} url.`
  )
);
