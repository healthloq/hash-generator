import React from "react";
import { Box, LinearProgress, Typography, styled } from "../";

const LinearProgressBar = styled(LinearProgress)(({ theme }) => ({
  '& .MuiLinearProgress-barColorPrimary': {
    backgroundColor: '#008F2B',
  },
}))
export default function MuiLinearProgress(props) {
  return props.loading ? (
    <LinearProgressBar />
  ) : (
    <Box display="flex" alignItems="center" justifyContent={"space-between"}>
      <LinearProgressBar
        style={{ width: "100%", marginRight: 10 }}
        variant="determinate"
        value={props.value}
      />
      <Typography variant="body2" color="textSecondary">
        {props.label}
      </Typography>
    </Box>
  );
}
