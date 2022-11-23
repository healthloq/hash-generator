import * as React from "react";
import { Box, Typography, LinearProgress } from "../";

function LinearProgressWithLabel({ totalCount, completedCount }) {
  const value = (completedCount * 100) / totalCount;
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress variant="determinate" value={value} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="primary">{`${Math.round(
          value
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel(props) {
  return (
    <Box sx={{ width: "100%" }}>
      <LinearProgressWithLabel {...props} />
    </Box>
  );
}
