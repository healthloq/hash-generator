import React from "react";
import { TextField, InputAdornment } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { handleSyncedFilter } from "../../redux/actions";
import { connect } from "react-redux";
import { Search } from "@mui/icons-material";

const useStyle = makeStyles((theme) => ({
  filterContainer: {
    padding: 20,
    backgroundColor: theme.palette.common.white,
  },
  searchTextfield: {
    maxWidth: 300,
  },
}));

export function SyncedFilesFilter({ handleSyncedFilter, syncedFilesFilter }) {
  const classes = useStyle();
  return (
    <TextField
      label="Search files by fileName"
      value={syncedFilesFilter?.searchText}
      onChange={(e) =>
        handleSyncedFilter({
          searchText: e.target.value.trim(),
          isFilterData: e.target.value?.trim() === "",
        })
      }
      variant="standard"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Search
              sx={{ cursor: "pointer" }}
              onClick={() => handleSyncedFilter({ isFilterData: true })}
            />
          </InputAdornment>
        ),
      }}
      className={classes.searchTextfield}
    />
  );
}

const mapStateToProps = ({ reducer: { syncedFilesFilter } }) => ({
  syncedFilesFilter,
});

const mapDispatchToProps = {
  handleSyncedFilter,
};

export default connect(mapStateToProps, mapDispatchToProps)(SyncedFilesFilter);
