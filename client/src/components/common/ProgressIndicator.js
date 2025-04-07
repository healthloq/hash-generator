import { Box, CircularProgress, Typography } from "@mui/material";
import React from "react";

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
      <Typography
        variant="h6"
        component="div"
        sx={(theme) => ({
          fontWeight: 600,
          fontSize: "14px",
        })}
      >
        {value}
        <Typography
          variant="body2"
          component="span"
          sx={(theme) => ({
            color: "gray",
            fontSize: "14px",
          })}
        >
          {" "}
          / {max}
        </Typography>
      </Typography>
    </Box>
  );
}

export default ProgressIndicator;
