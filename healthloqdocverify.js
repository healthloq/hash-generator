require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 7001;
const app = express();
const cors = require("cors");
const path = require("path");
const chokidar = require("chokidar");
const { LocalStorage } = require("node-localstorage");
global.localStorage = new LocalStorage("./scratch", Number.MAX_SAFE_INTEGER);
const server = require("http").createServer(app);

const {
  getSyncData,
  setDocumentSyncTimeout,
  setDocumentSyncInterval,
} = require("./utils");
const { getSubscriptionDetail } = require("./services/healthloq");
// const watcher = chokidar.watch(process.env.ROOT_FOLDER_PATH, {
//   persistent: true,
// });

module.exports = io = require("socket.io")(server);

io.on("connection", (socket) => {
  app.socket = socket;

  socket.on("disconnect", () => {
    console.log(socket?.id);
    global.isVerifierScriptRunning = false;
  });
});

(async () => {
  const subscriptionDetail = await getSubscriptionDetail();
  global.subscriptionDetail = subscriptionDetail?.data;
  if (
    subscriptionDetail?.data?.filter(
      (item) => item?.subscription_type === "publisher"
    )?.length
  ) {
    getSyncData();
    setDocumentSyncInterval();
    // watcher.on("all", async (eventName, filePath, state = {}) => {
    //   if (["add", "unlink", "change"].includes(eventName)) {
    //     setDocumentSyncTimeout();
    //   }
    // });
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
