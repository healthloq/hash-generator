import React, { useState } from "react";
import {
  Card, CardContent, Typography, Box, Button, Divider,
  CircularProgress, Alert, Chip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory";
import { format, parseISO } from "date-fns";

const ENTITY_CONFIG = [
  { key: "organization", label: "Organizations", Icon: BusinessIcon,   color: "#1976d2" },
  { key: "location",     label: "Locations",     Icon: LocationOnIcon, color: "#388e3c" },
  { key: "product",      label: "Products",      Icon: CategoryIcon,   color: "#f57c00" },
  { key: "batch",        label: "Batches",        Icon: InventoryIcon,  color: "#7b1fa2" },
];

export default function MetadataCacheStatus({ data, loading, onRefresh }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [result,        setResult]        = useState(null);

  const counts      = data?.counts   || {};
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
              {ENTITY_CONFIG.map(({ key, label, Icon, color }) => (
                <Box
                  key={key}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon sx={{ fontSize: 18, color }} />
                    <Typography variant="body2" color="text.secondary">
                      {label}
                    </Typography>
                  </Box>
                  <Chip
                    label={counts[key] ?? 0}
                    size="small"
                    sx={{ fontWeight: 600, minWidth: 44 }}
                  />
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
  );
}
