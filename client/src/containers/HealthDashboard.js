import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Container, IconButton,
  Tooltip, CircularProgress, Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { get, post } from "../Api";

import SystemStatus       from "../components/health/SystemStatus";
import SummaryCards       from "../components/health/SummaryCards";
import ProcessingHistogram from "../components/health/ProcessingHistogram";
import FailedFilesList    from "../components/health/FailedFilesList";
import ServiceControl      from "../components/health/ServiceControl";
import MetadataCacheStatus from "../components/health/MetadataCacheStatus";
import AlertRules          from "../components/health/AlertRules";

const POLL_INTERVAL_MS = 30_000;

export default function HealthDashboard() {

  const [status,      setStatus]      = useState(null);
  const [summary,     setSummary]     = useState(null);
  const [failedFiles, setFailedFiles] = useState([]);
  const [metaCache,   setMetaCache]   = useState(null);

  const [loadingStatus,    setLoadingStatus]    = useState(true);
  const [loadingSummary,   setLoadingSummary]   = useState(true);
  const [loadingFailed,    setLoadingFailed]    = useState(true);
  const [loadingMetaCache, setLoadingMetaCache] = useState(true);
  const [refreshing,       setRefreshing]       = useState(false);
  const [forceSyncing,     setForceSyncing]     = useState(false);

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

  const fetchMetaCache = useCallback(async () => {
    try {
      const res = await get("/api/health/metadata-cache");
      if (res?.status === "1") setMetaCache(res);
    } finally {
      setLoadingMetaCache(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchStatus(), fetchSummary(), fetchFailedFiles(), fetchMetaCache()]);
    setRefreshing(false);
  }, [fetchStatus, fetchSummary, fetchFailedFiles, fetchMetaCache]);

  // ── Mount + polling ──────────────────────────────────────────────────────

  useEffect(() => {
    fetchStatus();
    fetchSummary();
    fetchFailedFiles();
    fetchMetaCache();

    intervalRef.current = setInterval(() => {
      fetchStatus();
      fetchSummary();
      fetchFailedFiles();
      fetchMetaCache();
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, [fetchStatus, fetchSummary, fetchFailedFiles, fetchMetaCache]);

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

  const handleServiceAction = async (action) => {
    const res = await post(`/api/health/service/${action}`);
    if (res?.status !== "1") throw new Error(res?.message || `${action} failed`);
    setTimeout(() => fetchStatus(), 600);
    return res.message;
  };

  const handleMetaCacheRefresh = async () => {
    const res = await post("/api/health/metadata-cache/refresh");
    if (res?.status !== "1") throw new Error(res?.message || "Refresh failed");
    // Poll until the background refresh finishes (up to ~60 s)
    let polls = 0;
    const check = setInterval(async () => {
      polls++;
      await fetchMetaCache();
      const latest = await get("/api/health/metadata-cache");
      if (!latest?.refreshing || polls >= 12) clearInterval(check);
      if (latest?.status === "1") setMetaCache(latest);
    }, 5000);
    return res.message;
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

        {/* Row 1: System status | Service control | Metadata cache */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 3 }}>
          <SystemStatus
            status={status}
            loading={loadingStatus}
            onForceSync={handleForceSync}
            forceSyncing={forceSyncing}
          />
          <ServiceControl
            serviceState={status?.serviceState}
            loading={loadingStatus}
            onAction={handleServiceAction}
          />
          <MetadataCacheStatus
            data={metaCache}
            loading={loadingMetaCache}
            onRefresh={handleMetaCacheRefresh}
          />
        </Box>

        {/* Row 2: Summary cards */}
        <Box>
          <Box sx={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            bgcolor: "#EAF6EC", borderRadius: "8px 8px 0 0",
            px: 2, py: 1, mb: 1.5,
          }}>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Documents Processed
            </Typography>
            <Tooltip title="Refresh all">
              <IconButton size="small" onClick={refreshAll} disabled={refreshing}>
                {refreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
          <SummaryCards summary={summary} loading={loadingSummary} />
        </Box>

        {/* Row 3: Histogram */}
        <ProcessingHistogram />

        {/* Row 4: Failed files */}
        <FailedFilesList
          files={failedFiles}
          loading={loadingFailed}
          onReprocess={handleReprocess}
        />

        {/* Row 5: Email alerts */}
        <AlertRules />
      </Box>
    </Container>
  );
}
