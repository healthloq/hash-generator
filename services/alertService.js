/**
 * Alert service — monitors hashing service state and document processing activity,
 * then sends email notifications when configured thresholds are breached.
 *
 * Alert types:
 *   service_offline  — hashing service has been stopped for >= threshold_minutes
 *   no_documents     — no files processed (success or failed) for >= threshold_minutes
 *
 * Emails are rate-limited per rule: a given rule will not fire again until
 * threshold_minutes has elapsed since its last send.
 */

const { db } = require("../db");
const nodemailer = require("nodemailer");
const logger = require("../logger");

const CHECK_INTERVAL_MS = 60 * 1000; // check every minute
let _interval = null;

// ── Transport ──────────────────────────────────────────────────────────────

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  });
}

// ── Prepared statements ────────────────────────────────────────────────────

const stmtEnabledRules  = db.prepare("SELECT * FROM alert_rules WHERE enabled = 1");
const stmtUpdateSent    = db.prepare("UPDATE alert_rules SET last_sent_at = datetime('now') WHERE id = ?");
const stmtLastProcessed = db.prepare("SELECT MAX(processed_at) AS ts FROM processing_log");
const stmtOfflineSince  = db.prepare("SELECT value FROM store WHERE key = 'service_offline_since'");

// ── Sending ────────────────────────────────────────────────────────────────

async function sendAlert(rule, subject, body) {
  if (!process.env.SMTP_HOST) {
    logger.warn({ ruleId: rule.id }, "SMTP not configured — skipping alert email");
    return;
  }
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to:   rule.email,
      subject,
      text: body,
    });
    stmtUpdateSent.run(rule.id);
    logger.info({ ruleId: rule.id, email: rule.email, subject }, "Alert email sent");
  } catch (err) {
    logger.error({ err, ruleId: rule.id }, "Failed to send alert email");
  }
}

// ── Condition checks ───────────────────────────────────────────────────────

async function checkRule(rule, now) {
  // Per-rule cooldown: don't re-fire until threshold_minutes after last send
  if (rule.last_sent_at) {
    const msSinceSent = now - new Date(rule.last_sent_at.replace(" ", "T") + "Z");
    if (msSinceSent < rule.threshold_minutes * 60_000) return;
  }

  if (rule.alert_type === "service_offline") {
    if (global.serviceEnabled !== false) return; // service is up, nothing to do

    const row = stmtOfflineSince.get();
    if (!row) return;
    const offlineSince   = new Date(row.value);
    const minutesOffline = (now - offlineSince) / 60_000;
    if (minutesOffline < rule.threshold_minutes) return;

    const mins = Math.round(minutesOffline);
    await sendAlert(
      rule,
      `Alert: Hashing service offline for ${mins} minutes`,
      `The HealthLOQ hashing service has been offline for approximately ${mins} minutes.\n\n` +
      `Alert threshold: ${rule.threshold_minutes} minutes\n\n` +
      `Please check your HealthLOQ Document Protection application and restart the service if needed.`
    );
  } else if (rule.alert_type === "no_documents") {
    const row = stmtLastProcessed.get();
    if (!row?.ts) return; // no records at all yet

    const lastProcessed = new Date(row.ts.replace(" ", "T") + "Z");
    const minutesSince  = (now - lastProcessed) / 60_000;
    if (minutesSince < rule.threshold_minutes) return;

    const mins = Math.round(minutesSince);
    await sendAlert(
      rule,
      `Alert: No documents processed for ${mins} minutes`,
      `No documents have been processed in the last ${mins} minutes.\n\n` +
      `Alert threshold: ${rule.threshold_minutes} minutes\n` +
      `Last processing event: ${lastProcessed.toLocaleString()}\n\n` +
      `Please check your HealthLOQ Document Protection application.`
    );
  }
}

async function checkAlerts() {
  const now   = new Date();
  const rules = stmtEnabledRules.all();
  for (const rule of rules) {
    await checkRule(rule, now);
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────

exports.startAlertChecker = () => {
  if (_interval) return;
  _interval = setInterval(() => {
    checkAlerts().catch((err) => logger.error({ err }, "Alert check error"));
  }, CHECK_INTERVAL_MS);
  logger.info("Alert checker started (interval: 1 min)");
};

exports.stopAlertChecker = () => {
  if (_interval) {
    clearInterval(_interval);
    _interval = null;
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────

const stmtList   = db.prepare("SELECT * FROM alert_rules ORDER BY created_at DESC");
const stmtGetOne = db.prepare("SELECT * FROM alert_rules WHERE id = ?");
const stmtInsert = db.prepare(
  "INSERT INTO alert_rules (alert_type, email, threshold_minutes, enabled) VALUES (?, ?, ?, ?)"
);
const stmtDelete = db.prepare("DELETE FROM alert_rules WHERE id = ?");

exports.listRules = () => stmtList.all();

exports.createRule = ({ alert_type, email, threshold_minutes, enabled }) => {
  const res = stmtInsert.run(alert_type, email, threshold_minutes ?? 60, enabled !== false ? 1 : 0);
  return stmtGetOne.get(res.lastInsertRowid);
};

exports.updateRule = (id, fields) => {
  const allowed = ["alert_type", "email", "threshold_minutes", "enabled"];
  const sets = [], vals = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      vals.push(key === "enabled" ? (fields[key] ? 1 : 0) : fields[key]);
    }
  }
  if (sets.length) {
    vals.push(id);
    db.prepare(`UPDATE alert_rules SET ${sets.join(", ")} WHERE id = ?`).run(...vals);
  }
  return stmtGetOne.get(id);
};

exports.deleteRule = (id) => stmtDelete.run(id);

exports.sendTestEmail = async (email) => {
  if (!process.env.SMTP_HOST) throw new Error("SMTP is not configured");
  const transporter = createTransport();
  await transporter.sendMail({
    from:    process.env.SMTP_FROM || process.env.SMTP_USER,
    to:      email,
    subject: "Test Alert — HealthLOQ Document Protection",
    text:
      "This is a test alert from your HealthLOQ Document Protection application.\n\n" +
      "Your email alerts are configured correctly.",
  });
};
