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
  Grid,
  IconButton,
  Tooltip,
  Autocomplete,
} from "..";
import VisibilityIcon from "@mui/icons-material/Visibility";
import axios from "axios";
import {
  MuiLinearProgress,
  DocumentVerificationDetailOverview,
} from "../common";
import { rightIcon, wrongIcon, questionMarkLogo } from "../../assets";
import { connect } from "react-redux";
import {
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
  setApiFlagsInitialState,
  fetchFolderPath,
} from "../../redux/actions";
import { numberWithCommas, abbrNum } from "../../utils";
import EnhancedTable from "../TableComponents";
import { verifiedDocumentsHeaders } from "../../constants/tableConfigs";
import moment from "moment";

const useStyle = makeStyles((theme) => ({
  formRoot: {
    width: "100%",
    "&>div:not(:last-child)": {
      marginTop: 10,
    },
    "&>form": {
      "&>div": {
        "&>button": {
          marginLeft: 10,
        },
      },
    },
    [theme.breakpoints.down("md")]: {
      "&>form": {
        "&>div": {
          flexDirection: "column",
          "&>*": {
            "&:not(:first-child)": {
              marginTop: 10,
            },
            "&:first-child": {
              width: "100%",
              marginRight: 0,
            },
          },
          "&>button": {
            marginLeft: "0 !important",
          },
        },
      },
    },
  },
  docVerificationOverviewBox: {
    border: `2px solid ${theme.palette.primary.main}`,
    borderRadius: 10,
    padding: "10px 15px",
    backgroundColor: theme.palette.secondary.main,
    height: 150,
    boxSizing: "border-box",
    "&>p": {
      "&:first-child": {
        color: theme.palette.common.black,
        fontSize: 60,
        lineHeight: "65px",
        marginBottom: 5,
        "&>img": {
          marginLeft: 5,
          width: 30,
          height: 30,
        },
      },
      "&:last-child": {},
    },
  },
  selectBox: {
    minHeight: 45,
    width: "35%",
    maxWidth: "35%",
    minWidth: "35%",
    marginRight: 10,
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
  },
  autoCompleteStyle: {
    minHeight: 45,
    width: "35%",
    maxWidth: "35%",
    minWidth: "35%",
    marginRight: 10,
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%",
    },
    "&>div": {
      "&>div": {
        marginTop: "0px !important",
        border: "2px solid red",
      },
    },
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
  fetchFolderPath,
  getFolderPathList,
}) {
  const classes = useStyle();
  const [folderPath, setFolderPath] = useState(null);
  const [organizationIds, setOrganizationIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [text, setText] = useState(null);
  const [filesCount, setFilesCount] = useState({
    totalFile: 0,
    newFile: 0,
  });

  const [
    documentDetailOverviewDialogData,
    setDocumentDetailOverviewDialogData,
  ] = useState(null);
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
    fetchFolderPath();
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
      setOptions(getFolderPathList?.data);
    }
  }, [getFolderPathList]);

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

  // call api for add data into list
  const handleAdd = (value) => {
    if (value && !options.includes(value)) {
      setOptions([...options, value]);
      setFolderPath(value);
    }
  };
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
                    placeholder="Enter folder path"
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
                  <div
                    style={{
                      display: "flex",
                      fontSize: "12px",
                      gap: "10px",
                      color: "gray",
                    }}
                  >
                    <p>
                      Total Files Count:
                      {filesCount?.totalFile ?? 0}
                    </p>

                    <p>New Files Count:{filesCount?.newFile ?? 0}</p>
                  </div>
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
                  <Typography style={{ fontSize: "18px" }}>
                    No path found
                  </Typography>
                )
              }
              className={classes.selectBox}
            />

            <Button
              variant="contained"
              disabled={Boolean(
                documentVerificationData.isLoading ||
                  folderOverview.isLoading ||
                  folderOverview?.errorMsg ||
                  !folderPath ||
                  documentVerificationData.newFilesCount < 1
              )}
              type="submit"
              startIcon={
                documentVerificationData.isLoading && (
                  <CircularProgress size={20} />
                )
              }
            >
              {documentVerificationData.isLoading ? "Verifying" : "Verify"}
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
                  parseInt(documentVerificationData?.newFilesCount)
                )}`,
                value:
                  (documentVerificationData?.verifiedFilesCount * 100) /
                  documentVerificationData?.newFilesCount,
              }}
            />
          </Box>
        )}
        {!documentVerificationData?.isLoading &&
          documentVerificationData?.isDocVerificationFinalOverview && (
            <>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={4}>
                  <Box className={classes.docVerificationOverviewBox}>
                    <Typography variant="body1">
                      {numberWithCommas(
                        parseInt(
                          documentVerificationData?.noOfVerifiedDocumentsWithVerifiedOrg
                        )
                      )}
                      <img src={rightIcon} alt="right-icon" />
                    </Typography>
                    <Typography variant="body2">
                      Number of verified documents with verified organizations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Box className={classes.docVerificationOverviewBox}>
                    <Typography variant="body1">
                      {numberWithCommas(
                        parseInt(
                          documentVerificationData?.noOfVerifiedDocumentsWithUnVerifiedOrg
                        )
                      )}
                      <img src={questionMarkLogo} alt="right-icon" />
                    </Typography>
                    <Typography variant="body2">
                      Number of verified documents with unverified organizations
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <Box className={classes.docVerificationOverviewBox}>
                    <Typography variant="body1">
                      {numberWithCommas(
                        parseInt(
                          documentVerificationData?.noOfUnverifiedDocuments
                        )
                      )}
                      <img src={wrongIcon} alt="wrong-icon" />
                    </Typography>
                    <Typography variant="body2">
                      Number of unverified documents
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <EnhancedTable
                  tableTitle="Document Verification Overview"
                  headCells={verifiedDocumentsHeaders}
                  rows={documentVerificationData?.filteredVerificationData?.map(
                    (item) => {
                      const data = {
                        organization_name: item["Organization Name"],
                        is_verified_organization:
                          item["Is Verified Organization"],
                        file_name: item["File Name"],
                        file_path: item["File Path"],
                        is_verified_document: item["Is Verified Document"],
                        created: item["Created"]
                          ? moment(item["Created"]).format("MM/DD/YYYY hh:mm A")
                          : "",
                        message: item["Message"],
                        error_message: item["Error Message"],
                      };
                      return {
                        ...data,
                        action: (
                          <Tooltip arrow title="View More">
                            <IconButton
                              color="primary"
                              onClick={() =>
                                setDocumentDetailOverviewDialogData({
                                  ...item,
                                  Created: item["Created"]
                                    ? moment(item["Created"]).format(
                                        "MM/DD/YYYY hh:mm A"
                                      )
                                    : "",
                                })
                              }
                            >
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                        ),
                      };
                    }
                  )}
                  tableId="documentVerificationOverviewFilter"
                  isLoading={false}
                />
              </Box>
            </>
          )}
      </Box>
      <DocumentVerificationDetailOverview
        open={Boolean(documentDetailOverviewDialogData)}
        handleClose={() => setDocumentDetailOverviewDialogData(null)}
        data={documentDetailOverviewDialogData || {}}
      />
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
  },
}) => ({
  documentVerificationData,
  organizationList,
  folderOverview,
  apiFlags,
  getFolderPathList,
});

const mapDispatchToProps = {
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
  setApiFlagsInitialState,
  fetchFolderPath,
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentVerifier);
