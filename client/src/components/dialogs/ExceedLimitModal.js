import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function ExceedLimitModal({ open, onClose, onUpgrade }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
          boxShadow: 4,
        },
      }}
    >
      {/* Close Button */}
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={{
          position: "absolute",
          right: 8,
          top: 8,
          color: (theme) => theme.palette.grey[500],
        }}
      >
        <CloseIcon />
      </IconButton>

      {/* Icon & Title */}
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ mt: 3 }}
      >
        <Box
          sx={{
            backgroundColor: "#E8F5E9",
            borderRadius: "50%",
            p: 2,
            mb: 2,
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 40, color: "#28A745" }} />
        </Box>
        <DialogTitle sx={{ p: 0, fontWeight: 600, textAlign: "center" }}>
          Upgrade to Keep Growing
        </DialogTitle>
      </Box>

      {/* Content */}
      <DialogContent sx={{ textAlign: "center", mt: 1 }}>
        <Typography variant="body1" sx={{ mb: 1.5 }}>
          You’ve reached your current monthly usage limit.
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Upgrade your plan to verify additional documents.
        </Typography>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ justifyContent: "center", pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "#28A745",
            color: "#28A745",
            textTransform: "none",
            px: 3,
          }}
        >
          Maybe Later
        </Button>
        <Button
          onClick={() =>
            window.open(
              `${process.env.REACT_APP_HEALTHLOQ_ORGANIZATION_APP_BASE_URL}/plans?tab=3`,
              "_blank"
            )
          }
          variant="contained"
          sx={{
            backgroundColor: "#28A745",
            textTransform: "none",
            px: 3,
            "&:hover": { backgroundColor: "#218838" },
          }}
        >
          Upgrade Now
        </Button>
      </DialogActions>
    </Dialog>
  );
}
