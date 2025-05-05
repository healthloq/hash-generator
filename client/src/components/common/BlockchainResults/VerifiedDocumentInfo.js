import { Box, Typography } from "@mui/material";
import React from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import { styled } from "@mui/system";
import moment from "moment";
import { getValidUrl } from "../../../utils";

const errorColor = "#FFAA1D";

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) =>
    prop !== "isExpired" && prop !== "govEntityEmpty",
})(({ theme, isExpired, govEntityEmpty }) => ({
  position: "relative",
  width: "100%",
  maxWidth: 700,
  margin: "0 auto",
  borderRadius: 10,
  border: `2px solid ${isExpired ? errorColor : theme.palette.primary.main}`,
  fontSize: "0.85rem",
  lineHeight: 1.4,

  ...(govEntityEmpty && {
    "&::before, &::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: 8,
      backgroundColor: errorColor,
      zIndex: 1,
    },
    "&::after": {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z' fill='white'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
    },
  }),

  "& > div:first-of-type": {
    display: "flex",
    alignItems: "center",
    padding: "5px 20px",
    borderBottom: `2px solid ${
      isExpired ? errorColor : theme.palette.primary.main
    }`,
    background: isExpired ? "#FFAA1D30" : "#28A74530",
    "& > h6": {
      textAlign: "center",
      fontWeight: 700,
      width: "calc(100% - 65px)",
    },
    "& > svg": {
      width: 40,
      height: 40,
      color: isExpired ? errorColor : theme.palette.primary.main,
      marginLeft: 15,
    },
  },

  "& > div:nth-of-type(2)": {
    padding: "10px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    "& > p": {
      marginBottom: 8,
      textAlign: "center",
      "& > span": {
        fontWeight: 700,
        "&:nth-of-type(2)": {
          fontStyle: "italic",
          "& > a": {
            color: theme.palette.primary.main,
          },
        },
      },
    },
  },

  "& > div:last-of-type": {
    padding: "10px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderTop: `2px solid ${theme.palette.borderColor}`,
    "& > div:not(:last-of-type)": {
      marginBottom: 16,
    },
    "& p": {
      textAlign: "center",
      wordBreak: "break-word",
      margin: "2px 0",
      "&:first-of-type": {
        fontWeight: 700,
      },
      "& > span": {
        fontWeight: 700,
      },
    },
  },
}));

export default function VerifiedDocumentInfo({
  organization_name = "",
  domain_name = "",
  verified_at = null,
  document_id = "",
  organization_id = "",
  batch_id = "",
  govEntity = [],
  is_expired = false,
}) {
  const formattedDate = verified_at
    ? moment(verified_at).format("MM/DD/YYYY")
    : "N/A";

  return (
    <StyledBox isExpired={is_expired} govEntityEmpty={!govEntity?.length}>
      <Box>
        <Typography variant="subtitle1">Document Status: Verified</Typography>
        <CheckCircleOutlinedIcon />
      </Box>

      <Box>
        <Typography variant="body2">
          This document is verified as the original, unaltered document as
          submitted by:
        </Typography>
        <Typography variant="body2">
          <span>{organization_name}</span>
          {Boolean(domain_name) && (
            <>
              &nbsp;from&nbsp;
              <span>
                <a
                  href={getValidUrl(domain_name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {domain_name}
                </a>
              </span>
            </>
          )}
        </Typography>
        <Typography variant="caption">on</Typography>
        <Typography variant="body2">{formattedDate}</Typography>
      </Box>

      <Box>
        <Box>
          <Typography variant="body2">Document Information</Typography>
          <Typography variant="caption">Document ID: {document_id}</Typography>
        </Box>
        <Box>
          <Typography variant="body2">Digitally Signed By</Typography>
          <Typography variant="caption">
            Organization Name: {organization_name}
          </Typography>
          <Typography variant="caption">
            Organization ID: {organization_id}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2">Block Location</Typography>
          <Typography
            sx={{ display: "flex", textAlign: "center" }}
            variant="caption"
          >
            Block ID: {batch_id?.IonText}
          </Typography>
        </Box>
      </Box>
    </StyledBox>
  );
}
