import React from "react";
import { makeStyles, Box, LinearProgress, Typography } from "../";

const useStyle = makeStyles((theme) => ({
  primaryBgColor: {
    backgroundColor: "#008F2B",
  },
}));

export default function MuiLinearProgress(props) {
  const classes = useStyle();
  return props.loading ? (
    <LinearProgress classes={{ barColorPrimary: classes.primaryBgColor }} />
  ) : (
    <Box display="flex" alignItems="center" justifyContent={"space-between"}>
      <LinearProgress
        classes={{ barColorPrimary: classes.primaryBgColor }}
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
