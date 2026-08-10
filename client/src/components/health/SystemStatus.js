import React, { useState } from "react";
import {
  Alert, Card, CardContent, Typography, Chip, Box, Button,
  Divider, CircularProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import SyncIcon from "@mui/icons-material/Sync";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function SystemStatus({ status, onForceSync }) {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState(null);

  if (!status) return null;

  const { version, lastSyncedDate, syncRunning, verifierRunning, subscriptionTypes, rootFolderPath, nextScheduledSync } = status;

  const formattedDate = lastSyncedDate
    ? new Date(lastSyncedDate).toLocaleString()
    : "Never";

  const formattedNextSync = nextScheduledSync
    ? new Date(nextScheduledSync).toLocaleString()
    : "Unknown";

  const handleForceSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const msg = await onForceSync();
      setResult({ type: "success", message: msg || "Sync complete" });
    } catch (err) {
      setResult({ type: "error", message: err.message || "Force sync failed" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>System Status</Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={syncing ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={handleForceSync}
            disabled={syncing || syncRunning}
          >
            {syncing || syncRunning ? "Syncing…" : "Force Sync"}
          </Button>
        </Box>

        {result && (
          <Alert severity={result.type} onClose={() => setResult(null)} sx={{ mb: 2 }} size="small">
            {result.message}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Row label="Version" value={`v${version}`} />
          <Row label="Last Sync" value={formattedDate} />
          <Row label="Next Sync" value={syncRunning ? "Running now…" : formattedNextSync} />

          <Divider />

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              size="small"
              icon={syncRunning ? <SyncIcon /> : <CheckCircleOutlineIcon />}
              label={syncRunning ? "Syncing" : "Sync Idle"}
              color={syncRunning ? "warning" : "success"}
              variant="outlined"
            />
            {verifierRunning && (
              <Chip
                size="small"
                icon={<SyncIcon />}
                label="Verifier Running"
                color="info"
                variant="outlined"
              />
            )}
            {(subscriptionTypes || []).map((t) => (
              <Chip key={t} size="small" label={t} variant="filled" color="primary" />
            ))}
          </Box>

          {rootFolderPath && (
            <>
              <Divider />
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <FolderOpenIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2" sx={{ wordBreak: "break-all", color: "text.secondary" }}>
                  {rootFolderPath}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}
