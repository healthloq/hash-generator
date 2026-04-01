import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  getFolderOverview,
  fetchFolderPath,
  fetchVerifyDocumentCount,
  handleDocumentVerification,
  setInitialState,
} from "../../redux/actions";
import axios from "axios";
import { ReactComponent as VerifyDocumentIcon } from "../../assets/images/submitIcon.svg";
import { MuiLinearProgress } from "../common";
import { abbrNum, numberWithCommas } from "../../utils";

function DocumentVerifierNewDesign({
  organizationList,
  fetchVerifyDocumentCount,
  getFolderOverview,
  getFolderPathList,
  documentVerificationData,
  folderOverview,
  fetchFolderPath,
  handleDocumentVerification,
}) {
  const [folderPath, setFolderPath] = useState(null);
  const [options, setOptions] = useState([]);
  const [text, setText] = useState(null);
  const [filesCount, setFilesCount] = useState({
    totalFile: 0,
    newFile: 0,
  });
  const handleAdd = (value) => {
    if (value && !options.includes(value)) {
      setOptions([...options, value]);
      setFolderPath(value);
    }
  };

  // By default sending all producer
  const handleVerifyDoc = (e) => {
    if (folderPath?.trim()) {
      handleDocumentVerification({
        folderPath,
        selectedOrganizations: organizationList?.data,
      });
      if (folderPath?.trim() && !options.includes(folderPath?.trim())) {
        setOptions([...options, folderPath?.trim()]);
        setFolderPath(folderPath?.trim());
      }
    }
  };

  useEffect(() => {
    fetchFolderPath();
    // Fetch the server-configured root folder path to use as the default
    axios.get(
      `${process.env.REACT_APP_API_BASE_URL || ""}/api/health/status`
    ).then((res) => {
      const root = res.data?.rootFolderPath;
      if (root) {
        setFolderPath(root);
        setText(root);
        setOptions((prev) => (prev.includes(root) ? prev : [root, ...prev]));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (documentVerificationData) {
      setFilesCount({
        totalFile: documentVerificationData?.totalFilesCount,
        newFile: documentVerificationData?.newFilesCount,
      });
    }
  }, [documentVerificationData]);

  useEffect(() => {
    if (getFolderPathList?.data?.length > 0) {
      setOptions((prev) => {
        const incoming = getFolderPathList.data;
        // Keep any server-default path that isn't in the saved list
        const extras = prev.filter((p) => !incoming.includes(p));
        return [...extras, ...incoming];
      });
    }
  }, [getFolderPathList]);

  useEffect(() => {
    if (documentVerificationData?.isDocVerificationFinalOverview) {
      fetchVerifyDocumentCount({ path: folderPath?.trim() });
    }
  }, [documentVerificationData, folderPath]);

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    if (folderPath) {
      getFolderOverview({ folderPath }, { cancelToken: cancelToken.token });
    }
    return () => {
      cancelToken.cancel();
    };
  }, [folderPath]);
  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* <Select
        multiple
        fullWidth
        value={organizationIds}
        onChange={(e, newValue) => {
          if (newValue?.props?.value === "all") {
            setOrganizationIds((pre) =>
              pre?.length === organizationList?.data?.length
                ? []
                : organizationList?.data?.map((item) => item?.id)
            );
          } else {
            setOrganizationIds(e.target.value);
          }
        }}
        renderValue={(selected) => {
          if (selected.length === 0) {
            return "Select Producer";
          }

          return organizationList?.data
            ?.filter((item) => selected?.includes(item?.id))
            ?.map((item) => item?.name)
            ?.join(", ");
        }}
        disableUnderline
        variant="standard"
        style={{
          minHeight: 45,
          marginRight: 10,
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
        <MenuItem value={""} disabled>
          <Typography className="notranslate" variant="body2">
            Select Producer
          </Typography>
        </MenuItem>
        {organizationList?.isLoading &&
          organizationList?.data?.length === 0 && (
            <MenuItem value={"loading"} disabled>
              <Typography className="notranslate" variant="body2">
                Loading...
                <CircularProgress size={20} sx={{ ml: 1 }} />
              </Typography>
            </MenuItem>
          )}
        <MenuItem value={"all"}>
          <Checkbox
            checked={organizationIds?.length === organizationList?.data?.length}
          />
          <Typography className="notranslate" variant="body2">
            Select All
          </Typography>
        </MenuItem>
        {organizationList?.data?.map((item, i) => {
          return (
            <MenuItem key={i} value={item?.id}>
              <Checkbox checked={organizationIds.indexOf(item?.id) > -1} />
              <Typography className="notranslate" variant="body2">
                {item?.name}
              </Typography>
            </MenuItem>
          );
        })}
      </Select> */}
      <Autocomplete
        onChange={(event, newValue) => {
          setFolderPath(newValue);
          setInitialState(["folderOverview", "documentVerificationData"]);
        }}
        value={folderPath}
        options={options}
        renderOption={(props, option) => (
          <li style={{ fontSize: " 18px" }} {...props}>
            {option}
          </li>
        )}
        onInputChange={(event) => {
          if (event) {
            setText(event.target.value);
            setFolderPath(event.target.value);
          }
        }}
        renderInput={(params) => (
          <div>
            <TextField
              {...params}
              placeholder="Enter file location"
              variant="standard"
              styletype="custom"
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
              }}
              required
              onChange={(event) => setText(event.target.value)}
              error={Boolean(folderOverview?.errorMsg)}
              disabled={documentVerificationData.isLoading}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAdd(event.target.value);
                }
              }}
            />

            {documentVerificationData && (
              <div
                style={{
                  display: "flex",
                  fontSize: "12px",
                  gap: "10px",
                  color: "gray",
                  justifyContent: "end",
                }}
              >
                <p>
                  Total Files:
                  {filesCount?.totalFile ?? 0}
                </p>

                <p>New Files:{filesCount?.newFile ?? 0}</p>
              </div>
            )}
          </div>
        )}
        fullWidth
        noOptionsText={
          text ? (
            <Typography
              style={{ cursor: "pointer", fontSize: "18px" }}
              onClick={() => handleAdd(text)}
            >
              Add {text}
            </Typography>
          ) : (
            <Typography style={{ fontSize: "18px" }}>No path found</Typography>
          )
        }
        style={{
          minHeight: 45,
          marginRight: 10,
        }}
      />
      {documentVerificationData?.isLoading && (
        <Box display="flex" flexDirection={"column"} sx={{ my: 1 }}>
          <MuiLinearProgress
            {...{
              loading: false,
              label: `${numberWithCommas(
                parseInt(documentVerificationData?.verifiedFilesCount)
              )}/${abbrNum(parseInt(documentVerificationData?.newFilesCount))}`,
              value:
                (documentVerificationData?.verifiedFilesCount * 100) /
                documentVerificationData?.newFilesCount,
            }}
          />
        </Box>
      )}
      <Button
        disabled={Boolean(
          documentVerificationData.isLoading ||
            folderOverview.isLoading ||
            folderOverview?.errorMsg ||
            !folderPath ||
            documentVerificationData.newFilesCount < 1 ||
            organizationList?.isLoading
        )}
        startIcon={
          documentVerificationData.isLoading ? (
            <CircularProgress size={20} />
          ) : (
            <VerifyDocumentIcon />
          )
        }
        onClick={handleVerifyDoc}
        variant="contained"
        type="submit"
      >
        {documentVerificationData.isLoading ? "Verfiying..." : "Verfiy"}
      </Button>
    </Box>
  );
}

const mapStateToProps = ({
  reducer: {
    organizationList,
    folderOverview,
    documentVerificationData,
    apiFlags,
    getFolderPathList,
    getVerifyDocumentCount,
  },
}) => ({
  documentVerificationData,
  organizationList,
  folderOverview,
  apiFlags,
  getFolderPathList,
  getVerifyDocumentCount,
});

const mapDispatchToProps = {
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
  fetchFolderPath,
  fetchVerifyDocumentCount,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentVerifierNewDesign);
