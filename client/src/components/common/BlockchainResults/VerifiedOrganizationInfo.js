import { Box, Typography } from "@mui/material";
import React from "react";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import moment from "moment";
import { styled } from "@mui/system";
import { certificateIcon } from "../../../assets";

const expiredColor = "#FFAA1D";
const verifiedColor = "#28A745";

const StyledBox = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isExpired",
})(({ theme, isExpired }) => ({
  position: "relative",
  width: "100%",
  maxWidth: 700,
  margin: "0 auto",
  borderRadius: 10,
  border: `2px solid ${isExpired ? expiredColor : verifiedColor}`,

  "& > div:first-of-type": {
    display: "flex",
    alignItems: "center",
    padding: "5px 20px",
    borderBottom: `2px solid ${isExpired ? expiredColor : verifiedColor}`,
    background: isExpired ? "#FFAA1D30" : "#28A74530",
    "& > .MuiTypography-root": {
      fontWeight: 700,
      flex: 1,
    },
    "& > svg": {
      width: 40,
      height: 40,
      color: isExpired ? expiredColor : verifiedColor,
      marginLeft: 15,
    },
  },

  "& > div:nth-of-type(2)": {
    padding: "10px 20px",
    textAlign: "center",
    "& > .MuiTypography-root": {
      marginBottom: 8,
    },
    "& span": {
      fontWeight: 700,
    },
  },

  "& > div:last-of-type": {
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
      textAlign: "center",
      "&:hover": {
        boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
      },
      "& > img": {
        width: 60,
        height: 60,
        objectFit: "contain",
        marginBottom: 5,
      },
    },
  },
}));

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
    <StyledBox isExpired={is_expired}>
      <Box sx={{ display: "flex", textAlign: "center" }}>
        <Typography variant="h6">
          Organization Status: {is_expired ? "Expired" : "Verified"}
        </Typography>
        {is_expired ? <CancelOutlinedIcon /> : <CheckCircleOutlinedIcon />}
      </Box>

      <Box>
        <Typography variant="body2">
          The following organizations have issued certifications validating{" "}
          <span>{organization_name}</span>.
        </Typography>
        <Typography variant="body2">
          Original, {is_expired ? "expired" : "verified"} accreditation issued
          directly from and digitally signed by the issuing organization.
        </Typography>
      </Box>

      <Box>
        {govEntity?.map((item, key) => (
          <Box key={key} onClick={() => onOrganizationClick(item)}>
            <img src={certificateIcon} alt="Organization Logo" />
            <Typography variant="body2" fontWeight={700}>
              {item?.name}
            </Typography>
            {item?.domain && (
              <Typography variant="body2">{item?.domain}</Typography>
            )}
            <Typography variant="caption">
              {moment(item?.verified_at).format("MM/DD/YYYY")}
            </Typography>
          </Box>
        ))}
      </Box>
    </StyledBox>
  );
}
