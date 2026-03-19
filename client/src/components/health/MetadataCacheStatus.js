import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Card, CardContent, Typography, Box, Button, Divider,
  CircularProgress, Alert, Chip, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell,
  TableSortLabel, TableContainer, TextField, InputAdornment,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { format, parseISO } from "date-fns";
import { get } from "../../Api";

// ── Entity configuration ────────────────────────────────────────────────────

const ENTITY_CONFIG = [
  {
    key: "organization",
    label: "Organizations",
    Icon: BusinessIcon,
    color: "#1976d2",
    columns: [
      { field: "id",   header: "ID"   },
      { field: "name", header: "Name" },
    ],
  },
  {
    key: "location",
    label: "Locations",
    Icon: LocationOnIcon,
    color: "#388e3c",
    columns: [
      { field: "id",       header: "ID"           },
      { field: "name",     header: "Name"         },
      { field: "org_name", header: "Organization" },
    ],
  },
  {
    key: "product",
    label: "Products",
    Icon: CategoryIcon,
    color: "#f57c00",
    columns: [
      { field: "id",       header: "ID"           },
      { field: "name",     header: "Name"         },
      { field: "org_name", header: "Organization" },
    ],
  },
  {
    key: "batch",
    label: "Batches",
    Icon: InventoryIcon,
    color: "#7b1fa2",
    columns: [
      { field: "id",           header: "ID"           },
      { field: "name",         header: "Name"         },
      { field: "org_name",     header: "Organization" },
      { field: "product_name", header: "Product"      },
    ],
  },
];

// ── Drill-down dialog ────────────────────────────────────────────────────────

function CacheEntriesDialog({ entityConfig, open, onClose }) {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [search,     setSearch]     = useState("");
  const [sortField,  setSortField]  = useState("name");
  const [sortDir,    setSortDir]    = useState("asc");
  const abortRef = useRef(null);

  const fetchEntries = useCallback(async () => {
    if (!entityConfig) return;
    if (abortRef.current) abortRef.current = false; // signal stale fetch to discard
    const token = {};
    abortRef.current = token;
    setLoading(true);
    try {
      const res = await get(`/api/health/metadata-cache/${entityConfig.key}`);
      if (token !== abortRef.current) return; // stale
      if (res?.status === "1") setRows(res.data);
    } finally {
      if (token === abortRef.current) setLoading(false);
    }
  }, [entityConfig]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSortField("name");
      setSortDir("asc");
      fetchEntries();
    } else {
      setRows([]);
    }
  }, [open, fetchEntries]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = rows
    .filter((row) =>
      entityConfig?.columns.some((col) =>
        String(row[col.field] ?? "").toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      const av = String(a[sortField] ?? "").toLowerCase();
      const bv = String(b[sortField] ?? "").toLowerCase();
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  if (!entityConfig) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
        <entityConfig.Icon sx={{ color: entityConfig.color }} />
        <Box sx={{ flexGrow: 1 }}>
          {entityConfig.label}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({filtered.length}{filtered.length !== rows.length ? ` of ${rows.length}` : ""} records)
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Search bar */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 480 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {entityConfig.columns.map((col) => (
                    <TableCell key={col.field} sx={{ fontWeight: 700 }}>
                      <TableSortLabel
                        active={sortField === col.field}
                        direction={sortField === col.field ? sortDir : "asc"}
                        onClick={() => handleSort(col.field)}
                      >
                        {col.header}
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={entityConfig.columns.length} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      {rows.length === 0 ? "No records in cache." : "No records match your search."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((row, i) => (
                    <TableRow key={row.id ?? i} hover>
                      {entityConfig.columns.map((col) => (
                        <TableCell key={col.field} sx={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          <Tooltip title={row[col.field] ?? ""} enterDelay={600} placement="top-start">
                            <span>{row[col.field] ?? <Typography component="span" color="text.disabled" variant="inherit">—</Typography>}</span>
                          </Tooltip>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} size="small">Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main tile ────────────────────────────────────────────────────────────────

export default function MetadataCacheStatus({ data, loading, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [result,        setResult]        = useState(null);
  const [dialogEntity,  setDialogEntity]  = useState(null); // entity config or null

  const counts      = data?.counts    || {};
  const lastUpdated = data?.lastUpdated;
  const isRefreshing = data?.refreshing || actionLoading;

  const handleRefresh = async () => {
    setActionLoading(true);
    setResult(null);
    try {
      const msg = await onRefresh();
      setResult({ type: "success", message: msg });
    } catch (err) {
      setResult({ type: "error", message: err.message || "Refresh failed" });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Card elevation={2} sx={{ height: "100%" }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Metadata Cache
          </Typography>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 2 }}>
                {ENTITY_CONFIG.map((cfg) => (
                  <Box
                    key={cfg.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <cfg.Icon sx={{ fontSize: 18, color: cfg.color }} />
                      <Typography variant="body2" color="text.secondary">
                        {cfg.label}
                      </Typography>
                    </Box>
                    <Tooltip title={counts[cfg.key] > 0 ? `View ${cfg.label}` : ""} placement="left">
                      <Chip
                        label={counts[cfg.key] ?? 0}
                        size="small"
                        clickable={counts[cfg.key] > 0}
                        onClick={counts[cfg.key] > 0 ? () => setDialogEntity(cfg) : undefined}
                        sx={{
                          fontWeight: 600,
                          minWidth: 44,
                          cursor: counts[cfg.key] > 0 ? "pointer" : "default",
                          ...(counts[cfg.key] > 0 && {
                            bgcolor: cfg.color,
                            color: "#fff",
                            "&:hover": { bgcolor: cfg.color, filter: "brightness(1.15)" },
                          }),
                        }}
                      />
                    </Tooltip>
                  </Box>
                ))}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                {lastUpdated
                  ? `Last refreshed: ${format(parseISO(lastUpdated), "dd MMM yyyy HH:mm")} UTC`
                  : "Cache is empty — run a refresh to populate."}
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

              <Button
                variant="contained"
                size="small"
                startIcon={
                  isRefreshing
                    ? <CircularProgress size={14} color="inherit" />
                    : <RefreshIcon />
                }
                disabled={isRefreshing}
                onClick={handleRefresh}
                sx={{ minWidth: 140 }}
              >
                {isRefreshing ? "Refreshing…" : "Refresh Cache"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <CacheEntriesDialog
        entityConfig={dialogEntity}
        open={Boolean(dialogEntity)}
        onClose={() => setDialogEntity(null)}
      />
    </>
  );
}
