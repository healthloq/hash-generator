import React from "react";
import { Box, Container } from "../";

export default function Body({ children }) {
  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
