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
} from "..";
import axios from "axios";
import { MuiLinearProgress } from "../common";
import { rightIcon, wrongIcon } from "../../assets";
import { connect } from "react-redux";
import {
  getOrganizationList,
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
} from "../../redux/actions";
import { numberWithCommas } from "../../utils";

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
  },
}));

function DocumentVerifier({
  getOrganizationList,
  organizationList,
  getFolderOverview,
  folderOverview,
  handleDocumentVerification,
  documentVerificationData,
  setInitialState,
  subscriptionDetails,
}) {
  const classes = useStyle();
  const [folderPath, setFolderPath] = useState("");
  const [organization_id, setOrganization_id] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderPath?.trim() && organization_id) {
      handleDocumentVerification({ folderPath, organization_id });
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
    getOrganizationList();
  }, []);

  useEffect(() => {
    if (
      documentVerificationData?.isDocVerificationFinalOverview &&
      documentVerificationData?.url
    ) {
      window.open(documentVerificationData?.url, "_blank");
    }
  }, [documentVerificationData.isDocVerificationFinalOverview]);

  return (
    <Box sx={{ mb: 3 }}>
      <Box className={classes.formRoot}>
        <form onSubmit={handleSubmit}>
          <Box display={"flex"}>
            <Select
              sx={{ typography: "body2", width: "40%", mr: 1 }}
              value={organization_id}
              onChange={(e) => setOrganization_id(e.target.value)}
              disableUnderline
              variant="standard"
              className={classes.selectBox}
              required
              displayEmpty
            >
              <MenuItem value={""} disabled>
                <Typography
                  className="notranslate"
                  variant="body2"
                  textTransform={"uppercase"}
                >
                  Select Producer
                </Typography>
              </MenuItem>
              {organizationList?.isLoading &&
                organizationList?.data?.length === 0 && (
                  <MenuItem value={"loading"} disabled>
                    <Typography
                      className="notranslate"
                      variant="body2"
                      textTransform={"uppercase"}
                    >
                      Loading...
                      <CircularProgress size={20} sx={{ ml: 1 }} />
                    </Typography>
                  </MenuItem>
                )}
              {organizationList?.data?.map((item, i) => {
                return (
                  <MenuItem value={item.id} key={i}>
                    <Typography
                      className="notranslate"
                      variant="body2"
                      textTransform={"uppercase"}
                    >
                      {item.name}
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
                )}/${numberWithCommas(
                  parseInt(documentVerificationData?.totalFilesCount)
                )}`,
                value:
                  (documentVerificationData?.verifiedFilesCount * 100) /
                  documentVerificationData?.totalFilesCount,
              }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {documentVerificationData?.verificationType === "start"
                ? `Starting ${documentVerificationData?.fileName} document verification...`
                : `Complete ${documentVerificationData?.fileName} document verification.`}
            </Typography>
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
              <Typography variant="h6">
                No of errors in files:&nbsp;
                {numberWithCommas(
                  parseInt(documentVerificationData?.noOfErrors)
                )}
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
    subscriptionDetails,
  },
}) => ({
  documentVerificationData,
  organizationList,
  folderOverview,
  subscriptionDetails,
});

const mapDispatchToProps = {
  getOrganizationList,
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentVerifier);
