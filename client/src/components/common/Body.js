import React from "react";
import { Box, Container, Tooltip, Fab } from "../";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useNavigate } from "react-router-dom";

export default function Body({ children }) {
  const navigate = useNavigate();
  return (
    <Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>

      {/* Floating health-dashboard button — appears on every page */}
      <Tooltip title="Application Health" placement="left">
        <Fab
          size="medium"
          onClick={() => navigate("/health")}
          sx={{
            position: "fixed",
            bottom: 28,
            right: 28,
            bgcolor: "white",
            color: "primary.main",
            boxShadow: 3,
            "&:hover": { bgcolor: "primary.main", color: "white" },
          }}
        >
          <MonitorHeartIcon />
        </Fab>
      </Tooltip>
    </Box>
  );
}
