import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

function formatNumberShort(value) {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (value >= 1_000) {
    return (value / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  } else {
    return value.toString();
  }
}

function ProgressIndicator({ value, max }) {
  const progress = (value / max) * 100;
  return (
    <Box
      sx={(theme) => ({
        width: 80,
        height: 80,
        borderRadius: "50%",
        backgroundColor: theme.palette.secondary.main,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      })}
    >
      <CircularProgress
        variant="determinate"
        value={progress}
        size={80}
        thickness={4}
        sx={(theme) => ({
          color: theme.palette.primary.main,
          position: "absolute",
        })}
      />

      {/* Centered Text */}
      <Box
        sx={{
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          {formatNumberShort(value)}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontSize: "12px",
            color: "gray",
          }}
        >
          / {formatNumberShort(max)}
        </Typography>
      </Box>
    </Box>
  );
}

export default ProgressIndicator;
