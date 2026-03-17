require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 7001;
const app = express();
const cors = require("cors");
const path = require("path");
const chokidar = require("chokidar");
const rateLimit = require("express-rate-limit");
const logger = require("./logger");

global.localStorage = require("./db");
const server = require("http").createServer(app);

const {
  getSyncData,
  setDocumentSyncTimeout,
  setDocumentSyncInterval,
} = require("./utils");
const { getSubscriptionDetail } = require("./services/healthloq");

module.exports = io = require("socket.io")(server);

io.on("connection", (socket) => {
  app.socket = socket;

  socket.on("disconnect", () => {
    global.isVerifierScriptRunning = false;
  });
});

(async () => {
  const subscriptionDetail = await getSubscriptionDetail();
  global.subscriptionDetail = subscriptionDetail?.data;
  const isPublisher = subscriptionDetail?.data?.filter(
    (item) => item?.subscription_type === "publisher"
  )?.length;

  if (isPublisher) {
    getSyncData();
    setDocumentSyncInterval();

    const rootPath = process.env.ROOT_FOLDER_PATH;
    if (rootPath) {
      const watcher = chokidar.watch(rootPath, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 200 },
      });
      watcher.on("all", (eventName) => {
        if (["add", "unlink", "change"].includes(eventName)) {
          setDocumentSyncTimeout();
        }
      });
      watcher.on("error", (err) => logger.error({ err }, "chokidar watcher error"));
    }
  }
})();

// Restrict CORS to localhost only — this app is local-only
const allowedOrigin = `http://localhost:${port}`;
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting: max 200 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use("/public", express.static(path.join(__dirname, "./public")));
app.use("/api/client", require("./routes/client"));

// Health check endpoint
app.get("/health", (req, res) => {
  const staticData = (() => {
    try { return JSON.parse(global.localStorage.getItem("staticData") || "{}"); }
    catch { return {}; }
  })();
  res.status(200).json({
    status: "ok",
    version: require("./package.json").version,
    lastSyncedDate: staticData?.lastSyncedDate || null,
    syncRunning: global.isGetSyncDataProcessStart || false,
    verifierRunning: global.isVerifierScriptRunning || false,
    subscriptionTypes: (global.subscriptionDetail || []).map((s) => s.subscription_type),
  });
});

app.use(express.static(path.join(__dirname, "client/build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client/build/index.html"));
});

server.listen(port, () =>
  logger.info(`Server running at http://localhost:${port}`)
);
