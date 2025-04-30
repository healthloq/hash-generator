import { Box, Typography } from "@mui/material";
import React from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import moment from "moment";
import { styled } from "@mui/system";
import { certificateIcon } from "../../../assets";

// Styled Box component to apply the CSS directly within the component
const RootBox = styled(Box)(({ theme, isExpired }) => ({
  width: "100%",
  borderRadius: 10,
  border: `2px solid ${isExpired ? "#FFAA1D" : theme.palette.primary.main}`,
  maxWidth: 700,
  margin: "0 auto",
  "& > div": {
    "&:first-child": {
      display: "flex",
      alignItems: "center",
      padding: "5px 20px",
      borderBottom: `2px solid ${
        isExpired ? "#FFAA1D" : theme.palette.primary.main
      }`,
      background: isExpired ? "#FFAA1D30" : "#28A74530",
      "& > h5": {
        textAlign: "center",
        fontWeight: 700,
        width: "calc(100% - 65px)",
      },
      "& > svg": {
        width: 50,
        height: 50,
        color: isExpired ? "#FFAA1D" : theme.palette.primary.main,
        marginLeft: 15,
      },
    },
    "&:nth-child(2)": {
      padding: "10px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      "& > p": {
        marginBottom: 10,
        textAlign: "center",
        "& > span": {
          fontWeight: 700,
        },
      },
    },
    "&:last-child": {
      padding: "10px 20px",
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      "& > div": {
        padding: 20,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        maxWidth: 200,
        "& > img": {
          width: 60,
          height: 60,
          objectFit: "contain",
          marginBottom: 5,
        },
        "& > p": {
          textAlign: "center",
          "&:nth-child(2)": {
            fontWeight: 700,
          },
        },
        "&:hover": {
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
        },
      },
    },
  },
}));

const BlockchainProofExpiredNew = styled("div")`
  &:not(:last-child) {
    &::before {
      background-color: #d6513f;
    }
    &::after {
      background-color: #d6513f;
      background-image: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath d='M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm0 12H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z' fill='white' /%3E%3C/svg%3E");
    }
  }
`;

export default function VerifiedOrganizationInfo({
  organization_name = "",
  govEntity = [],
  onOrganizationClick = () => {},
}) {
  const is_expired = govEntity?.reduce(
    (result, item) => item?.is_expired && result,
    true
  );

  return (
    <RootBox isExpired={is_expired}>
      <Box>
        <Typography variant="h5">
          Organization Status: {is_expired ? "Expired" : "Verified"}
        </Typography>
        {is_expired ? <CancelOutlinedIcon /> : <CheckCircleOutlinedIcon />}
      </Box>
      <Box>
        <Typography variant="body1">
          The following organizations have issued certifications
          validating&nbsp;
          <span>{organization_name}</span>.
        </Typography>
        <Typography variant="body1">
          Original, {is_expired ? "expired" : "verified"} accreditation issued
          directly from, and digitally signed by the issuing organization.
        </Typography>
      </Box>
      <Box>
        {govEntity?.map((item, key) => {
          return (
            <Box
              key={key}
              onClick={() => onOrganizationClick(item)}
              sx={{
                padding: 2,
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                maxWidth: 200,
                "&:hover": {
                  boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
                },
              }}
            >
              <img
                src={certificateIcon}
                alt="Organization Logo"
                style={{
                  width: 60,
                  height: 60,
                  objectFit: "contain",
                  marginBottom: 5,
                }}
              />
              <Typography variant="body1">{item?.name}</Typography>
              {Boolean(item?.domain) && (
                <Typography variant="body2" fontWeight={700}>
                  {item?.domain}
                </Typography>
              )}
              <Typography variant="body2">
                {moment(item?.verified_at).format("MM/DD/YYYY")}
              </Typography>
            </Box>
          );
        })}
      </Box>
      {is_expired && <BlockchainProofExpiredNew />}
    </RootBox>
  );
}
