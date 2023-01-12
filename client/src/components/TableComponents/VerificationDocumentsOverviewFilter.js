import React from "react";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  InputLabel,
  Menu,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { handleDocumentVerificationDataFilter } from "../../redux/actions";
import { connect } from "react-redux";

const useStyle = makeStyles((theme) => ({
  filterContainer: {
    padding: 20,
    backgroundColor: theme.palette.common.white,
  },
}));

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
  anchorRef,
  handleClose,
  documentVerificationFilters,
  handleDocumentVerificationDataFilter,
}) {
  const classes = useStyle();

  return (
    <Menu
      open={Boolean(anchorRef)}
      anchorEl={anchorRef}
      onClose={handleClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
    >
      <Box className={classes.filterContainer}>
        <InputLabel sx={{ mb: 0.5 }}>Filter Documents</InputLabel>
        <Select
          label="Select"
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
      </Box>
    </Menu>
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
