const pino = require("pino");

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: { pid: process.pid },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  process.env.NODE_ENV === "production"
    ? pino.destination({ dest: "./logs/app.log", sync: false })
    : pino.transport({ target: "pino-pretty", options: { colorize: true } })
);

module.exports = logger;
