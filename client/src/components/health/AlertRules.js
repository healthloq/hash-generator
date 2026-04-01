import React, { useState, useEffect, useCallback } from "react";
import {
  Card, CardContent, Typography, Box, Button, IconButton,
  Switch, FormControlLabel, TextField, MenuItem, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableHead, TableRow,
  Chip, Alert, CircularProgress, Skeleton,
} from "@mui/material";
import AddIcon         from "@mui/icons-material/Add";
import DeleteIcon      from "@mui/icons-material/Delete";
import EditIcon        from "@mui/icons-material/Edit";
import SendIcon        from "@mui/icons-material/Send";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { get, post, put, deleteM } from "../../Api";

const ALERT_TYPES = [
  { value: "service_offline", label: "Hashing service goes offline" },
  { value: "no_documents",    label: "No documents processed" },
];

const THRESHOLD_OPTIONS = [
  { value: 5,    label: "5 minutes" },
  { value: 15,   label: "15 minutes" },
  { value: 30,   label: "30 minutes" },
  { value: 60,   label: "1 hour" },
  { value: 120,  label: "2 hours" },
  { value: 360,  label: "6 hours" },
  { value: 720,  label: "12 hours" },
  { value: 1440, label: "24 hours" },
];

const EMPTY_FORM = { alert_type: "service_offline", email: "", threshold_minutes: 60, enabled: true };

export default function AlertRules() {
  const [rules,   setRules]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [dialogOpen,  setDialogOpen]  = useState(false);
  const [editingRule, setEditingRule] = useState(null); // null = new
  const [form,        setForm]        = useState(EMPTY_FORM);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState(null);

  const [testEmail,    setTestEmail]    = useState("");
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testSending,  setTestSending]  = useState(false);
  const [testResult,   setTestResult]   = useState(null);

  const fetchRules = useCallback(async () => {
    try {
      const res = await get("/api/health/alert-rules");
      if (res?.status === "1") setRules(res.data);
      else setError(res?.message || "Failed to load alert rules");
    } catch {
      setError("Failed to load alert rules");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRules(); }, [fetchRules]);

  const openNew = () => {
    setEditingRule(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (rule) => {
    setEditingRule(rule);
    setForm({
      alert_type:        rule.alert_type,
      email:             rule.email,
      threshold_minutes: rule.threshold_minutes,
      enabled:           !!rule.enabled,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    if (!form.email || !form.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      let res;
      if (editingRule) {
        res = await put(`/api/health/alert-rules/${editingRule.id}`, form);
      } else {
        res = await post("/api/health/alert-rules", form);
      }
      if (res?.status === "1") {
        await fetchRules();
        setDialogOpen(false);
      } else {
        setFormError(res?.message || "Save failed");
      }
    } catch {
      setFormError("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteM(`/api/health/alert-rules/${id}`);
      setRules((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete rule");
    }
  };

  const handleToggle = async (rule) => {
    const res = await put(`/api/health/alert-rules/${rule.id}`, { enabled: !rule.enabled });
    if (res?.status === "1") {
      setRules((prev) => prev.map((r) => r.id === rule.id ? res.data : r));
    }
  };

  const handleTest = async () => {
    setTestResult(null);
    setTestSending(true);
    try {
      const res = await post("/api/health/alert-rules/test", { email: testEmail });
      setTestResult(res?.status === "1"
        ? { ok: true,  msg: res.message }
        : { ok: false, msg: res?.message || "Send failed" }
      );
    } catch {
      setTestResult({ ok: false, msg: "Send failed" });
    } finally {
      setTestSending(false);
    }
  };

  const thresholdLabel = (mins) =>
    THRESHOLD_OPTIONS.find((o) => o.value === mins)?.label || `${mins} min`;

  return (
    <>
      <Card elevation={2}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <NotificationsIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>Email Alerts</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                size="small"
                startIcon={<SendIcon />}
                variant="outlined"
                onClick={() => { setTestEmail(""); setTestResult(null); setTestDialogOpen(true); }}
              >
                Test Email
              </Button>
              <Button size="small" startIcon={<AddIcon />} variant="contained" onClick={openNew}>
                Add Alert
              </Button>
            </Box>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Skeleton variant="rectangular" height={120} />
          ) : rules.length === 0 ? (
            <Box sx={{
              textAlign: "center", py: 4, px: 2,
              bgcolor: "grey.50", borderRadius: 2, border: "1px dashed", borderColor: "grey.300",
            }}>
              <NotificationsIcon sx={{ fontSize: 40, color: "grey.400", mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                No alert rules configured. Add one to receive email notifications.
              </Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Condition</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Threshold</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Enabled</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} hover>
                    <TableCell>
                      <Chip
                        size="small"
                        label={ALERT_TYPES.find((t) => t.value === rule.alert_type)?.label || rule.alert_type}
                        color={rule.alert_type === "service_offline" ? "warning" : "info"}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{rule.email}</TableCell>
                    <TableCell sx={{ fontSize: "0.8rem" }}>{thresholdLabel(rule.threshold_minutes)}</TableCell>
                    <TableCell>
                      <Switch
                        size="small"
                        checked={!!rule.enabled}
                        onChange={() => handleToggle(rule)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEdit(rule)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(rule.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editingRule ? "Edit Alert Rule" : "New Alert Rule"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField
            select fullWidth size="small" label="Alert condition"
            value={form.alert_type}
            onChange={(e) => setForm((f) => ({ ...f, alert_type: e.target.value }))}
          >
            {ALERT_TYPES.map((t) => (
              <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth size="small" label="Email address" type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="alerts@example.com"
          />
          <TextField
            select fullWidth size="small" label="Send alert if condition persists for"
            value={form.threshold_minutes}
            onChange={(e) => setForm((f) => ({ ...f, threshold_minutes: parseInt(e.target.value, 10) }))}
          >
            {THRESHOLD_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={form.enabled}
                onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))}
              />
            }
            label="Enable this alert"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={18} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test email dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "12px !important" }}>
          <Typography variant="body2" color="text.secondary">
            Sends a test message to verify your SMTP configuration is working.
          </Typography>
          {testResult && (
            <Alert severity={testResult.ok ? "success" : "error"}>{testResult.msg}</Alert>
          )}
          <TextField
            fullWidth size="small" label="Email address" type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={testSending ? <CircularProgress size={16} /> : <SendIcon />}
            onClick={handleTest}
            disabled={testSending || !testEmail.includes("@")}
          >
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
