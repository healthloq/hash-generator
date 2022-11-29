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
import { LinearWithValueLabel } from "../common";
import { CSVDownload } from "react-csv";
import { rightIcon, wrongIcon } from "../../assets";
import { connect } from "react-redux";
import {
  getOrganizationList,
  getFolderOverview,
  handleDocumentVerification,
} from "../../redux/actions";

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
  },
  selectBox: {
    minHeight: 45,
  },
}));

function DocumentVerifier({
  docVerificationProgress,
  getOrganizationList,
  organizationList,
  getFolderOverview,
  folderOverview,
  handleDocumentVerification,
  documentVerificationData,
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
              onChange={(e) => setFolderPath(e.target.value?.trim())}
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
            <LinearWithValueLabel
              totalCount={docVerificationProgress?.totalFile}
              completedCount={
                docVerificationProgress?.verificationCompletedCount
              }
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {docVerificationProgress?.verificationType === "start"
                ? `Starting ${docVerificationProgress?.fileName} document verification...`
                : `Complete ${docVerificationProgress?.fileName} document verification.`}
            </Typography>
          </Box>
        )}
        {!documentVerificationData?.isLoading &&
          documentVerificationData?.data?.files?.length > 0 && (
            <Box
              display="flex"
              flexDirection="column"
              className={classes.documentVerificationOutput}
            >
              <Typography variant="h6">
                No of verified documents:&nbsp;
                {documentVerificationData?.data?.verifiedDocumentCount}
                <img src={rightIcon} alt="right-icon" />
              </Typography>
              <Typography variant="h6">
                No of unverified documents:&nbsp;
                {documentVerificationData?.data?.unVerifiedDocumentCount}
                <img src={wrongIcon} alt="wrong-icon" />
              </Typography>
              <Typography variant="h6">
                No of errors in files:&nbsp;
                {documentVerificationData?.data?.errorsCount}
              </Typography>
              <CSVDownload data={documentVerificationData?.data?.files} />
            </Box>
          )}
      </Box>
    </Box>
  );
}

const mapStateToProps = ({
  reducer: {
    docVerificationProgress,
    organizationList,
    folderOverview,
    documentVerificationData,
  },
}) => ({
  docVerificationProgress,
  documentVerificationData,
  organizationList,
  folderOverview,
});

const mapDispatchToProps = {
  getOrganizationList,
  getFolderOverview,
  handleDocumentVerification,
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentVerifier);
