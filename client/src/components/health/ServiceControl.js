import React, { useState } from "react";
import {
  Card, CardContent, Typography, Box, Button, Chip,
  Divider, CircularProgress, Alert,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StopIcon from "@mui/icons-material/Stop";
import ReplayIcon from "@mui/icons-material/Replay";

const STATE_CONFIG = {
  running: {
    label: "Running",
    color: "success",
    description: "The hashing service is active and currently processing documents.",
    pulse: true,
  },
  idle: {
    label: "Idle",
    color: "info",
    description: "The hashing service is active and waiting for the next sync trigger.",
    pulse: false,
  },
  stopped: {
    label: "Stopped",
    color: "error",
    description: "The hashing service has been manually stopped. New documents will not be hashed until it is started.",
    pulse: false,
  },
};

export default function ServiceControl({ serviceState, onAction, loading }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [result, setResult] = useState(null);

  const state = serviceState || "idle";
  const cfg   = STATE_CONFIG[state] || STATE_CONFIG.idle;
  const isStopped = state === "stopped";

  const handleAction = async (action) => {
    setActionLoading(action);
    setResult(null);
    try {
      const msg = await onAction(action);
      setResult({ type: "success", message: msg });
    } catch (err) {
      setResult({ type: "error", message: err.message || `${action} failed` });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Card elevation={2} sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Hashing Service
        </Typography>

        {/* Status indicator */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          {loading ? (
            <CircularProgress size={18} />
          ) : (
            <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              {cfg.pulse && (
                <Box
                  sx={{
                    position: "absolute",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    opacity: 0.4,
                    animation: "pulse 1.6s ease-in-out infinite",
                    "@keyframes pulse": {
                      "0%":   { transform: "scale(0.8)", opacity: 0.6 },
                      "50%":  { transform: "scale(1.4)", opacity: 0.2 },
                      "100%": { transform: "scale(0.8)", opacity: 0.6 },
                    },
                  }}
                />
              )}
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: `${cfg.color}.main`,
                  zIndex: 1,
                }}
              />
            </Box>
          )}
          <Chip
            label={cfg.label}
            color={cfg.color}
            size="small"
            variant="filled"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {cfg.description}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {result && (
          <Alert
            severity={result.type}
            onClose={() => setResult(null)}
            sx={{ mb: 2 }}
            size="small"
          >
            {result.message}
          </Alert>
        )}

        {/* Action buttons */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {isStopped ? (
            <ActionButton
              label="Start"
              action="start"
              icon={<PlayArrowIcon />}
              color="success"
              loading={actionLoading}
              onClick={handleAction}
            />
          ) : (
            <>
              <ActionButton
                label="Restart"
                action="restart"
                icon={<ReplayIcon />}
                color="warning"
                loading={actionLoading}
                onClick={handleAction}
              />
              <ActionButton
                label="Stop"
                action="stop"
                icon={<StopIcon />}
                color="error"
                loading={actionLoading}
                onClick={handleAction}
              />
            </>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function ActionButton({ label, action, icon, color, loading, onClick }) {
  const isLoading = loading === action;
  return (
    <Button
      variant="contained"
      color={color}
      size="small"
      startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : icon}
      disabled={!!loading}
      onClick={() => onClick(action)}
      sx={{ minWidth: 100 }}
    >
      {label}
    </Button>
  );
}
