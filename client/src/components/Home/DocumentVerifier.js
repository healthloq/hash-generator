import React, { useEffect, useState } from "react";
import {
  Typography,
  makeStyles,
  Box,
  TextField,
  Button,
  CircularProgress,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "..";
import axios from "axios";
import { MuiLinearProgress } from "../common";
import { rightIcon, wrongIcon } from "../../assets";
import { connect } from "react-redux";
import {
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
  setApiFlagsInitialState,
} from "../../redux/actions";
import { numberWithCommas, abbrNum } from "../../utils";

const useStyle = makeStyles((theme) => ({
  formRoot: {
    width: "100%",
    "&>div": {
      marginTop: 10,
    },
  },
  exportBtn: {
    textDecoration: "none",
    color: "unset",
    "&:hover": {
      textDecoration: "none",
    },
  },
  documentVerificationOutput: {
    "&>h6": {
      margin: "5px 0",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      "&>img": {
        marginLeft: 10,
        width: 25,
        height: 25,
      },
    },
    "&>p": {
      color: theme.palette.error.main,
    },
  },
  selectBox: {
    minHeight: 45,
    width: "35%",
    maxWidth: "35%",
    minWidth: "35%",
    marginRight: 10,
  },
}));

function DocumentVerifier({
  organizationList,
  getFolderOverview,
  folderOverview,
  handleDocumentVerification,
  documentVerificationData,
  setInitialState,
  apiFlags,
  setApiFlagsInitialState,
}) {
  const classes = useStyle();
  const [folderPath, setFolderPath] = useState("");
  const [organizationIds, setOrganizationIds] = useState([]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderPath?.trim() && organizationIds?.length) {
      handleDocumentVerification({
        folderPath,
        selectedOrganizations:
          organizationIds?.length === organizationList?.data?.length
            ? organizationList?.data
            : organizationList?.data?.filter((item) =>
                organizationIds?.includes(item?.id)
              ),
      });
    }
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    if (folderPath) {
      getFolderOverview({ folderPath }, { cancelToken: cancelToken.token });
    }
    return () => {
      cancelToken.cancel();
    };
  }, [folderPath]);

  useEffect(() => {
    if (apiFlags.downloadVerifierResultCSVFlag) {
      window.open(documentVerificationData?.url, "_blank");
      setApiFlagsInitialState(["downloadVerifierResultCSVFlag"]);
    }
  }, [apiFlags.downloadVerifierResultCSVFlag]);

  return (
    <Box sx={{ mb: 3 }}>
      <Box className={classes.formRoot}>
        <form onSubmit={handleSubmit}>
          <Box display={"flex"}>
            <Select
              multiple
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
              className={classes.selectBox}
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
                  checked={
                    organizationIds?.length === organizationList?.data?.length
                  }
                />
                <Typography className="notranslate" variant="body2">
                  Select All
                </Typography>
              </MenuItem>
              {organizationList?.data?.map((item, i) => {
                return (
                  <MenuItem key={i} value={item?.id}>
                    <Checkbox
                      checked={organizationIds.indexOf(item?.id) > -1}
                    />
                    <Typography className="notranslate" variant="body2">
                      {item?.name}
                    </Typography>
                  </MenuItem>
                );
              })}
            </Select>
            <TextField
              value={folderPath}
              onChange={(e) => {
                setFolderPath(e.target.value?.trim());
                setInitialState(["folderOverview", "documentVerificationData"]);
              }}
              type="text"
              placeholder="Enter folder path"
              variant="standard"
              styletype="custom"
              InputProps={{ disableUnderline: true }}
              required
              error={Boolean(folderOverview?.errorMsg)}
              helperText={
                folderOverview?.isLoading
                  ? "Please wait we are fetching folder info..."
                  : folderOverview?.errorMsg || folderOverview?.successMsg
              }
              disabled={documentVerificationData.isLoading}
            />
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              disabled={Boolean(
                documentVerificationData.isLoading ||
                  folderOverview.isLoading ||
                  folderOverview?.errorMsg ||
                  !folderPath
              )}
              type="submit"
              startIcon={
                documentVerificationData.isLoading && (
                  <CircularProgress size={20} />
                )
              }
            >
              Verify
            </Button>
          </Box>
        </form>
        {documentVerificationData?.isLoading && (
          <Box display="flex" flexDirection={"column"} sx={{ my: 1 }}>
            <MuiLinearProgress
              {...{
                loading: false,
                label: `${numberWithCommas(
                  parseInt(documentVerificationData?.verifiedFilesCount)
                )}/${abbrNum(
                  parseInt(documentVerificationData?.totalFilesCount)
                )}`,
                value:
                  (documentVerificationData?.verifiedFilesCount * 100) /
                  documentVerificationData?.totalFilesCount,
              }}
            />
          </Box>
        )}
        {!documentVerificationData?.isLoading &&
          documentVerificationData?.isDocVerificationFinalOverview && (
            <Box
              display="flex"
              flexDirection="column"
              className={classes.documentVerificationOutput}
            >
              <Typography variant="h6">
                No of verified documents:&nbsp;
                {numberWithCommas(
                  parseInt(documentVerificationData?.noOfVerifiedDocuments)
                )}
                <img src={rightIcon} alt="right-icon" />
              </Typography>
              <Typography variant="h6">
                No of unverified documents:&nbsp;
                {numberWithCommas(
                  parseInt(documentVerificationData?.noOfUnverifiedDocuments)
                )}
                <img src={wrongIcon} alt="wrong-icon" />
              </Typography>
              {documentVerificationData?.errorMsg && (
                <Typography variant="body1" sx={{ my: 1 }}>
                  {documentVerificationData?.errorMsg}
                </Typography>
              )}
            </Box>
          )}
      </Box>
    </Box>
  );
}

const mapStateToProps = ({
  reducer: {
    organizationList,
    folderOverview,
    documentVerificationData,
    apiFlags,
  },
}) => ({
  documentVerificationData,
  organizationList,
  folderOverview,
  apiFlags,
});

const mapDispatchToProps = {
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
  setApiFlagsInitialState,
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentVerifier);
