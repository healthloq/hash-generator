import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppBar, Box, Container, IconButton, Toolbar,
  Typography, Tooltip, CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { get, post } from "../Api";

import SystemStatus       from "../components/health/SystemStatus";
import SummaryCards       from "../components/health/SummaryCards";
import ProcessingHistogram from "../components/health/ProcessingHistogram";
import FailedFilesList    from "../components/health/FailedFilesList";

const POLL_INTERVAL_MS = 30_000;

export default function HealthDashboard() {
  const navigate = useNavigate();

  const [status,      setStatus]      = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [failedFiles, setFailedFiles] = useState([]);

  const [loadingStatus,  setLoadingStatus]  = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingFailed,  setLoadingFailed]  = useState(true);
  const [refreshing,     setRefreshing]     = useState(false);
  const [forceSyncing,   setForceSyncing]   = useState(false);

  const intervalRef = useRef(null);

  // ── Data fetchers ────────────────────────────────────────────────────────

  const fetchStatus = useCallback(async () => {
    try {
      const res = await get("/api/health/status");
      if (res) setStatus(res);
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await get("/api/health/summary");
      if (res?.status === "1") setSummary(res.data);
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  const fetchFailedFiles = useCallback(async () => {
    try {
      const res = await get("/api/health/failed-files");
      if (res?.status === "1") setFailedFiles(res.data);
    } finally {
      setLoadingFailed(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchSummary(), fetchFailedFiles()]);
    setRefreshing(false);
  }, [fetchStatus, fetchSummary, fetchFailedFiles]);

  // ── Mount + polling ──────────────────────────────────────────────────────

  useEffect(() => {
    fetchStatus();
    fetchSummary();
    fetchFailedFiles();

    intervalRef.current = setInterval(() => {
      fetchStatus();
      fetchSummary();
      fetchFailedFiles();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [fetchStatus, fetchSummary, fetchFailedFiles]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const handleForceSync = async () => {
    setForceSyncing(true);
    try {
      await post("/api/health/force-sync");
      await fetchStatus();
    } finally {
      setForceSyncing(false);
    }
  };

  const handleReprocess = async (filePaths) => {
    const res = await post("/api/health/reprocess", { filePaths });
    if (res?.status !== "1") throw new Error(res?.message || "Reprocess failed");
    // Refresh failed files after a short delay to allow sync to start
    setTimeout(() => fetchFailedFiles(), 3000);
    return res.message;
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Top nav bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Tooltip title="Back">
            <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
            Application Health
          </Typography>
          <Tooltip title="Refresh all">
            <IconButton onClick={refreshAll} disabled={refreshing}>
              {refreshing
                ? <CircularProgress size={20} />
                : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

          {/* Row 1: System status + summary cards side by side */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "320px 1fr" }, gap: 3 }}>
            <SystemStatus
              status={status}
              loading={loadingStatus}
              onForceSync={handleForceSync}
              forceSyncing={forceSyncing}
            />
            <Box>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                Documents Processed
              </Typography>
              <SummaryCards summary={summary} loading={loadingSummary} />
            </Box>
          </Box>

          {/* Row 2: Histogram */}
          <ProcessingHistogram />

          {/* Row 3: Failed files */}
          <FailedFilesList
            files={failedFiles}
            loading={loadingFailed}
            onReprocess={handleReprocess}
          />
        </Box>
      </Container>
    </Box>
  );
}
