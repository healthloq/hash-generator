import React, { useRef, useState } from "react";
import {
  Select,
  MenuItem,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  handleFilterValue,
} from "../../redux/actions";
import { connect } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import moment from "moment";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

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
  organizationList,
  handleFilterValue,
  filterValue,
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef(null);

  const handleChange = (name, value) => {
    handleFilterValue({
      [name]: value,
    });
  };

  const handleClearDateField = () => {
    handleFilterValue({
      date: null,
    });
  };
  return (
    <Grid sx={{ display: "flex", gap: 1 }}>
      <Grid
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        {filterValue.date && (
          <>
            <Typography variant="body2">
              {moment(filterValue.date).format("DD/MM/YYYY")}
            </Typography>
            <Tooltip title="Clear date filter">
              <IconButton onClick={handleClearDateField}>
                <HighlightOffIcon />
              </IconButton>
            </Tooltip>
          </>
        )}
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <div>
            <IconButton
              variant="contained"
              ref={buttonRef}
              onClick={() => setOpen(true)}
            >
              <CalendarMonthIcon />
            </IconButton>
            <DatePicker
              value={filterValue.date}
              onChange={(newValue) => handleChange("date", newValue)}
              open={open}
              onClose={() => setOpen(false)}
              slots={{
                openPickerButton: () => null,
                textField: () => null,
              }}
              slotProps={{
                popper: {
                  anchorEl: buttonRef.current,
                  placement: "bottom",
                },
              }}
            />
          </div>
        </LocalizationProvider>
      </Grid>

      <Select
        fullWidth
        value={filterValue.producer}
        onChange={(e) => handleChange("producer", e.target.value)}
        renderValue={(selected) => {
          if (selected === "") {
            return "Select Producer";
          }
          const temp = organizationList?.data?.data.find(
            (item) => selected === item?.name
          );
          return temp?.name;
        }}
        disableUnderline
        variant="standard"
        style={{
          marginRight: 10,
          maxWidth: 250,
          minWidth: 250,
        }}
        required
        displayEmpty
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 45 * 4.5,
            },
          },
        }}
        sx={{ typography: "body2" }}
      >
        <MenuItem value="">
          <Typography className="notranslate" variant="body2">
            Select Producer
          </Typography>
        </MenuItem>
        {organizationList?.isLoading &&
          organizationList?.data?.data?.length === 0 && (
            <MenuItem value={"loading"} disabled>
              <Typography className="notranslate" variant="body2">
                Loading...
                <CircularProgress size={20} sx={{ ml: 1 }} />
              </Typography>
            </MenuItem>
          )}
        {organizationList?.data?.data.map((item, i) => {
          return (
            <MenuItem key={i} value={item?.name}>
              <Typography className="notranslate" variant="body2">
                {item?.name}
              </Typography>
            </MenuItem>
          );
        })}
      </Select>
      <Select
        label="Filter Documents"
        variant="standard"
        onChange={(e) => {
          if (e.target.value) handleChange("verificationType", e.target.value);
        }}
        value={filterValue.verificationType}
        disableUnderline
        sx={{ typography: "body2", maxWidth: 250, minWidth: 250 }}
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
    </Grid>
  );
}

const mapStateToProps = ({
  reducer: { documentVerificationFilters, organizationList, filterValue },
}) => ({
  documentVerificationFilters,
  organizationList,
  filterValue,
});

const mapDispatchToProps = {
  handleFilterValue,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VerificationDocumentsOverviewFilter);
