import React from "react";
import { Box, Container, makeStyles } from "../";
const useStyle = makeStyles((theme) => ({
  bodyContainerRoot: {},
}));

export default function Body({ children }) {
  const classes = useStyle();
  return (
    <Box className={classes.bodyContainerRoot}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
