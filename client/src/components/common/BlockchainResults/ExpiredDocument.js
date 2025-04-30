import { Box, Typography } from "@mui/material";
import React from "react";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import moment from "moment";
import { getValidUrl } from "../../../utils";

export default function ExpiredDocument({
  effective_date = null,
  organization_name = "",
  domain_name = "",
  verified_at = null,
}) {
  const sxStyles = {
    width: "100%",
    borderRadius: 2,
    border: "2px solid #FFAA1D",
    maxWidth: 700,
    margin: "0 auto",
    "& > div:first-of-type": {
      display: "flex",
      alignItems: "center",
      padding: "5px 20px",
      borderBottom: "2px solid #FFAA1D",
      backgroundColor: "#FFAA1D30",
      "& > h5": {
        textAlign: "center",
        fontWeight: 700,
        width: "calc(100% - 65px)",
      },
      "& > svg": {
        width: 50,
        height: 50,
        color: "#FFAA1D",
        marginLeft: 2,
      },
    },
    "& > div:last-of-type": {
      padding: "10px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      "& > p": {
        textAlign: "center",
        "&:nth-of-type(1)": {
          marginBottom: 1,
        },
        "&:nth-of-type(2)": {
          "& > span:nth-of-type(2)": {
            fontStyle: "italic",
            "& > a": {
              color: "primary.main",
            },
          },
        },
        "&:nth-of-type(4)": {
          fontWeight: 700,
        },
        "& span": {
          fontWeight: 700,
        },
      },
    },
    "&:not(:last-child)::before": {
      content: '""',
      display: "block",
      backgroundColor: "#FFAA1D",
      height: "4px", // adjust as needed
    },
    "&:not(:last-child)::after": {
      content: '""',
      display: "block",
      backgroundColor: "#FFAA1D",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z' fill='white' /%3E%3C/svg%3E\")",
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      height: "24px", // adjust if needed
    },
  };

  return (
    <Box sx={sxStyles}>
      <Box>
        <Typography variant="h5">Document Status: Expired</Typography>
        <CancelOutlinedIcon />
      </Box>
      <Box>
        <Typography variant="body1">
          This document was expired at&nbsp;
          <span>{moment(effective_date).format("MM/DD/YYYY")}</span>, unaltered
          document as submitted by:
        </Typography>
        <Typography variant="body1">
          <span>{organization_name}</span>&nbsp;
          {domain_name ? (
            <>
              from&nbsp;
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
          ) : null}
        </Typography>
        <Typography variant="body2">on</Typography>
        <Typography variant="body1">
          {moment(verified_at).format("MM/DD/YYYY")}
        </Typography>
      </Box>
    </Box>
  );
}
