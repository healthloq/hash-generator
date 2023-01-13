import React from "react";
import { Select, MenuItem, Typography } from "@mui/material";
import { handleDocumentVerificationDataFilter } from "../../redux/actions";
import { connect } from "react-redux";

let docVerificationTypes = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "verifiedDocWithVerifiedOrg",
    label: "Verified documents with verified organization",
  },
  {
    value: "verifiedDocWithUnverifiedOrg",
    label: "Verified documents with unverified organization",
  },
  {
    value: "unverifiedDoc",
    label: "Unverified documents",
  },
];

export function VerificationDocumentsOverviewFilter({
  documentVerificationFilters,
  handleDocumentVerificationDataFilter,
}) {
  return (
    <Select
      label="Filter Documents"
      variant="standard"
      onChange={(e) => {
        if (e.target.value)
          handleDocumentVerificationDataFilter({
            verificationType: e.target.value,
          });
      }}
      value={documentVerificationFilters?.verificationType}
      disableUnderline
      sx={{ typography: "body2", minWidth: 250 }}
      MenuProps={{
        anchorOrigin: {
          vertical: "top",
          horizontal: "right",
        },
        transformOrigin: {
          vertical: "top",
          horizontal: "right",
        },
      }}
    >
      {docVerificationTypes?.map((item, key) => (
        <MenuItem value={item?.value} key={key}>
          <Typography variant="body2">{item?.label}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
}

const mapStateToProps = ({ reducer: { documentVerificationFilters } }) => ({
  documentVerificationFilters,
});

const mapDispatchToProps = {
  handleDocumentVerificationDataFilter,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerificationDocumentsOverviewFilter);
