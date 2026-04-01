import React, { useState } from "react";
import {
  Card, CardContent, Typography, Box, Button, Checkbox,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Chip, Tooltip, Alert, CircularProgress,
  IconButton, Collapse,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

const ERROR_COLORS = {
  FILE_READ_ERROR: "error",
  FILE_STAT_ERROR: "warning",
  SYNC_API_ERROR:  "info",
  UNKNOWN:         "default",
};

export default function FailedFilesList({ files, loading, onReprocess }) {
  const [selected, setSelected] = useState([]);
  const [reprocessing, setReprocessing] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [result, setResult] = useState(null);

  const allSelected = files?.length > 0 && selected.length === files.length;
  const toggleAll = () =>
    setSelected(allSelected ? [] : files.map((f) => f.file_path));
  const toggleOne = (path) =>
    setSelected((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );

  const handleReprocess = async () => {
    if (!selected.length) return;
    setReprocessing(true);
    setResult(null);
    try {
      const msg = await onReprocess(selected);
      setResult({ type: "success", message: msg });
      setSelected([]);
    } catch (err) {
      setResult({ type: "error", message: err.message || "Reprocess failed" });
    } finally {
      setReprocessing(false);
    }
  };

  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <Card elevation={2}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ErrorOutlineIcon color="error" />
            <Typography variant="h6" fontWeight={600}>Failed Files</Typography>
            {!loading && (
              <Chip
                size="small"
                label={files?.length ?? 0}
                color={files?.length ? "error" : "success"}
                variant="outlined"
              />
            )}
          </Box>

          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={reprocessing ? <CircularProgress size={14} color="inherit" /> : <ReplayIcon />}
            disabled={!selected.length || reprocessing}
            onClick={handleReprocess}
          >
            Reprocess Selected ({selected.length})
          </Button>
        </Box>

        {result && (
          <Alert
            severity={result.type}
            onClose={() => setResult(null)}
            sx={{ mb: 2 }}
          >
            {result.message}
          </Alert>
        )}

        {loading ? (
          <Typography color="text.secondary">Loading…</Typography>
        ) : !files?.length ? (
          <Alert severity="success" icon={false}>
            No failed files — everything processed successfully.
          </Alert>
        ) : (
          <TableContainer sx={{ maxHeight: 480 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={selected.length > 0 && !allSelected}
                      onChange={toggleAll}
                    />
                  </TableCell>
                  <TableCell><strong>File Name</strong></TableCell>
                  <TableCell><strong>Error</strong></TableCell>
                  <TableCell><strong>Last Attempt</strong></TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((f) => (
                  <React.Fragment key={f.id}>
                    <TableRow
                      hover
                      selected={selected.includes(f.file_path)}
                      sx={{ "& td": { borderBottom: "none" } }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={selected.includes(f.file_path)}
                          onChange={() => toggleOne(f.file_path)}
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={f.file_path} placement="top" arrow>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 260, cursor: "default" }}
                          >
                            {f.file_name}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={f.error_code || "UNKNOWN"}
                          color={ERROR_COLORS[f.error_code] || "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(f.processed_at).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {f.error_message && (
                          <IconButton
                            size="small"
                            onClick={() => toggleExpand(f.id)}
                          >
                            {expanded[f.id] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>

                    {f.error_message && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ pt: 0, pb: 1 }}>
                          <Collapse in={!!expanded[f.id]} unmountOnExit>
                            <Box sx={{ pl: 7 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontFamily: "monospace", wordBreak: "break-all" }}
                              >
                                {f.error_message}
                              </Typography>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
}
