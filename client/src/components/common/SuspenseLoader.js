import React from "react";
import { Box, CircularProgress } from "@mui/material";

export default function SuspenseLoader() {
  return (
    <Box
      display={"flex"}
      alignItems="center"
      justifyContent={"center"}
      sx={{ height: "100vh" }}
    >
      <CircularProgress size={80} />
    </Box>
  );
}
