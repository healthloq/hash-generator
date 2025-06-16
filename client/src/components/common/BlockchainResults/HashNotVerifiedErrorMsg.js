import { Box, Typography } from "@mui/material";
import React from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { styled } from "@mui/system";

// Constants
const errorColor = "#D6513F";
const expiredColor = "#FFAA1D";

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isExpired",
})(({ isExpired }) => ({
  position: "relative",
  width: "100%",
  maxWidth: 700,
  margin: "0 auto",
  borderRadius: 10,
  border: `2px solid ${isExpired ? expiredColor : errorColor}`,

  "&::before, &::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 0,
    backgroundColor: isExpired ? expiredColor : errorColor,
    zIndex: 1,
  },
  "&::after": {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z' fill='white' /%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  },

  "& > div:first-of-type": {
    display: "flex",
    alignItems: "center",
    padding: "4px 16px",
    borderBottom: `2px solid ${isExpired ? expiredColor : errorColor}`,
    background: isExpired ? "#FFAA1D30" : "#D6513F30",
    "& > h6": {
      textAlign: "center",
      fontWeight: 600,
      width: "calc(100% - 60px)",
      fontSize: "1rem",
    },
    "& > svg": {
      width: 40,
      height: 40,
      color: isExpired ? expiredColor : errorColor,
      marginLeft: 12,
    },
  },

  "& > div:last-of-type": {
    padding: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "& > p": {
      width: "100%",
      textAlign: "center",
      fontSize: "0.875rem",
      lineHeight: 1.5,
      "& > span": {
        fontWeight: 700,
      },
    },
  },
}));

export default function HashNotVerifiedErrorMsg({
  hashType = "",
  organization_name = "",
  is_expired = false,
}) {
  return (
    <StyledBox isExpired={is_expired}>
      <Box>
        <Typography variant="subtitle1">{hashType} Status: Not Verified</Typography>
        <CancelOutlinedIcon />
      </Box>
      <Box>
        <Typography variant="body2">
          {hashType === "Document" && (
            <>
              This document is <span>not verified</span> as authentic or
              digitally signed by a participating organization.
            </>
          )}
          {hashType === "Organization" && (
            <>
              <span>{organization_name}</span> has not published verifiable
              certifications.
            </>
          )}
        </Typography>
      </Box>
    </StyledBox>
  );
}
