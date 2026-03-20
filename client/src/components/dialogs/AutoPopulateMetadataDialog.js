import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Tooltip,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { post } from "../../Api";

// ── helpers ──────────────────────────────────────────────────────────────────

function pct(confidence) {
  return `${Math.round((confidence ?? 0) * 100)}%`;
}

/**
 * Build a human-readable summary of what was assigned for a single file result.
 *
 * Each present field shows its name + confidence.  Missing fields show "—".
 */
function MetadataChips({ suggestion }) {
  const fields = [
    { label: "Org",      value: suggestion?.organization },
    { label: "Location", value: suggestion?.location },
    { label: "Product",  value: suggestion?.product },
    { label: "Batch",    value: suggestion?.batch },
  ];

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.5 }}>
      {fields.map(({ label, value }) =>
        value ? (
          <Tooltip key={label} title={`${pct(value.confidence)} confidence`} placement="top">
            <Chip
              label={`${label}: ${value.name}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Tooltip>
        ) : (
          <Chip
            key={label}
            label={`${label}: —`}
            size="small"
            variant="outlined"
            sx={{ color: "text.disabled", borderColor: "divider" }}
          />
        )
      )}
    </Box>
  );
}

// ── main component ────────────────────────────────────────────────────────────

/**
 * Props:
 *   open              – boolean
 *   onClose           – () => void   called when user closes after processing
 *   selectedHashes    – string[]     list of file hashes to process
 *   dashboardOverview – object       passed through so the parent can reload data
 *   onComplete        – () => void   optional; called when all files are done
 */
export default function AutoPopulateMetadataDialog({
  open,
  onClose,
  selectedHashes = [],
  onComplete,
}) {
  const [results, setResults]     = useState([]);   // { hash, fileName, status, suggestion, applied, applyMessage }
  const [current, setCurrent]     = useState(0);    // index being processed (0-based)
  const [running, setRunning]     = useState(false);
  const [done, setDone]           = useState(false);
  const abortRef                  = useRef(false);

  // Reset state whenever the dialog opens
  useEffect(() => {
    if (open) {
      setResults([]);
      setCurrent(0);
      setRunning(false);
      setDone(false);
      abortRef.current = false;
    }
  }, [open]);

  const handleStart = async () => {
    if (!selectedHashes.length) return;
    setRunning(true);
    setDone(false);
    setResults([]);
    abortRef.current = false;

    for (let i = 0; i < selectedHashes.length; i++) {
      if (abortRef.current) break;
      setCurrent(i);
      const hash = selectedHashes[i];

      try {
        const res = await post("/api/client/auto-populate-metadata", { hash }, { timeout: 300_000 });
        if (abortRef.current) break;
        if (!res) {
          // axios timed out or got no response
          setResults((prev) => [...prev, {
            hash,
            fileName:     hash,
            status:       "error",
            suggestion:   null,
            applied:      false,
            applyMessage: "",
            message:      "Request timed out — the file may be too large to analyse",
          }]);
          continue;
        }
        setResults((prev) => [
          ...prev,
          {
            hash,
            fileName:     res?.fileName || hash,
            status:       res?.status === "1" ? "success" : "error",
            suggestion:   res?.suggestion || null,
            applied:      res?.applied || false,
            applyMessage: res?.applyMessage || "",
            message:      res?.message || "",
          },
        ]);
      } catch (err) {
        if (abortRef.current) break;
        setResults((prev) => [
          ...prev,
          {
            hash,
            fileName:     hash,
            status:       "error",
            suggestion:   null,
            applied:      false,
            applyMessage: "",
            message:      err?.message || "Request failed",
          },
        ]);
      }
    }

    setRunning(false);
    setDone(true);
    if (onComplete) onComplete();
  };

  const handleClose = () => {
    if (running) {
      abortRef.current = true;
    }
    onClose();
  };

  const progress = selectedHashes.length > 0
    ? Math.round((results.length / selectedHashes.length) * 100)
    : 0;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Auto-populate Metadata</DialogTitle>

      <DialogContent dividers>
        {/* Pre-start */}
        {!running && !done && (
          <Typography variant="body2" color="text.secondary">
            Claude AI will analyse {selectedHashes.length} selected file
            {selectedHashes.length !== 1 ? "s" : ""} and automatically assign
            the best-matching organization, location, product, and product batch
            for each one. Fields where the AI is less than 50% confident will
            be left blank.
          </Typography>
        )}

        {/* Progress bar */}
        {(running || done) && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
              <Typography variant="body2">
                {running
                  ? `Analysing file ${Math.min(current + 1, selectedHashes.length)} of ${selectedHashes.length}…`
                  : `Completed ${results.length} of ${selectedHashes.length} file${selectedHashes.length !== 1 ? "s" : ""}`}
              </Typography>
              <Typography variant="body2" color="text.secondary">{progress}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
        )}

        {/* Per-file results */}
        {results.length > 0 && (
          <>
            <Divider sx={{ mb: 1 }} />
            <List dense disablePadding>
              {results.map((r) => (
                <ListItem
                  key={r.hash}
                  alignItems="flex-start"
                  disableGutters
                  sx={{ flexDirection: "column", alignItems: "flex-start", py: 1 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                    {r.status === "success" ? (
                      <CheckCircleOutlineIcon fontSize="small" color="success" />
                    ) : (
                      <ErrorOutlineIcon fontSize="small" color="error" />
                    )}
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 340 }}>
                          {r.fileName}
                        </Typography>
                      }
                      secondary={
                        r.status === "error"
                          ? r.message || "Analysis failed"
                          : r.applied
                          ? "Metadata applied"
                          : "No confident matches found — metadata unchanged"
                      }
                    />
                    {r.status === "success" && r.suggestion?.reasoning && (
                      <Tooltip title={r.suggestion.reasoning} placement="left">
                        <HelpOutlineIcon fontSize="small" sx={{ color: "text.disabled", ml: "auto", flexShrink: 0 }} />
                      </Tooltip>
                    )}
                  </Box>

                  {r.status === "success" && r.suggestion && (
                    <Box sx={{ pl: 3.5, width: "100%" }}>
                      <MetadataChips suggestion={r.suggestion} />
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </>
        )}

        {/* In-flight spinner for current item */}
        {running && (
          <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {!running && !done && (
          <>
            <Button onClick={handleClose} size="small">Cancel</Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleStart}
              disabled={!selectedHashes.length}
            >
              Start
            </Button>
          </>
        )}
        {running && (
          <Button size="small" color="error" onClick={() => { abortRef.current = true; }}>
            Stop
          </Button>
        )}
        {done && (
          <Button variant="contained" size="small" onClick={handleClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
