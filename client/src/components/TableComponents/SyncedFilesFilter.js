import React from "react";
import { TextField, InputAdornment, styled } from "@mui/material";
import { handleSyncedFilter } from "../../redux/actions";
import { connect } from "react-redux";
import { Search } from "@mui/icons-material";

export function SyncedFilesFilter({ handleSyncedFilter, syncedFilesFilter }) {
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
      sx={{
        maxWidth: 300
      }}
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
