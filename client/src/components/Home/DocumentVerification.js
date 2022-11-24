import React, { useEffect, useState } from "react";
import {
  Typography,
  makeStyles,
  Box,
  TextField,
  Button,
  CircularProgress,
  Select,
  ListItemIcon,
  MenuItem,
  Avatar,
} from "../";
import axios from "axios";
import { LinearWithValueLabel } from "../common";
import { CSVLink, CSVDownload } from "react-csv";
import { rightIcon, wrongIcon } from "../../assets";
import { socket } from "../../configs/socket";

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

const folderOverviewDataDefaultObj = {
  isLoading: false,
  errorMsg: "",
  successMsg: "",
  filesCount: 0,
};

const documentVerificationDataDefaultObj = {
  isLoading: false,
  status: "",
  message: "",
  data: [],
};

const documentVerificationProgresDefaultObj = {
  totalFile: 0,
  verificationCompletedCount: 0,
  verificationType: "",
  fileName: "",
  filePath: "",
  isUpdated: false,
};

export default function DocumentVerification() {
  const classes = useStyle();
  const [folderPath, setFolderPath] = useState("");
  const [organization_id, setOrganization_id] = useState("");
  const [documentVerificationData, setDocumentVerificationData] = useState(
    documentVerificationDataDefaultObj
  );
  const [folderOverviewData, setFolderOverviewData] = useState(
    folderOverviewDataDefaultObj
  );
  const [organizationsData, setOrganizationsData] = useState({
    isLoading: false,
    data: [],
  });
  const [documentVerificationProgres, setDocumentVerificationProgres] =
    useState(documentVerificationProgresDefaultObj);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (folderPath?.trim() && organization_id) {
      setDocumentVerificationData((pre) => ({ ...pre, isLoading: true }));
      axios
        .post(
          `${process.env.REACT_APP_API_BASE_URL}/dashboard/verify-documents`,
          {
            folderPath,
            organization_id,
          }
        )
        .then((res) => {
          setDocumentVerificationData((pre) => ({
            ...pre,
            isLoading: false,
            ...res.data,
          }));
          setFolderOverviewData(folderOverviewDataDefaultObj);
          setDocumentVerificationProgres(documentVerificationProgresDefaultObj);
        })
        .catch((err) => {
          console.log(err);
          setDocumentVerificationData((pre) => ({ ...pre, isLoading: false }));
          setFolderOverviewData(folderOverviewDataDefaultObj);
        });
    }
  };

  useEffect(() => {
    const cancelToken = axios.CancelToken.source();
    if (folderPath) {
      setFolderOverviewData((pre) => ({ ...pre, isLoading: true }));
      axios
        .post(
          `${process.env.REACT_APP_API_BASE_URL}/dashboard/get-folder-overview`,
          {
            folderPath,
          },
          {
            cancelToken: cancelToken.token,
          }
        )
        .then((res) => {
          const {
            data: { errorMsg, filesCount },
          } = res.data;
          setFolderOverviewData((pre) => ({
            ...pre,
            isLoading: false,
            ...res?.data?.data,
            successMsg: !errorMsg ? `Total Files: ${filesCount}` : "",
          }));
          setDocumentVerificationProgres((pre) => ({
            ...pre,
            totalFile: filesCount,
          }));
        })
        .catch((err) => {
          console.log(err);
          setFolderOverviewData((pre) => ({
            ...pre,
            isLoading: false,
          }));
        });
    } else {
      setFolderOverviewData(folderOverviewDataDefaultObj);
    }
    return () => {
      cancelToken.cancel();
      setFolderOverviewData(folderOverviewDataDefaultObj);
    };
  }, [folderPath]);

  useEffect(() => {
    setOrganizationsData((pre) => ({ ...pre, isLoading: true }));
    axios
      .post(
        `${process.env.REACT_APP_HEALTHLOQ_API_BASE_URL}/client-app/organization-list`
      )
      .then((res) => {
        setOrganizationsData((pre) => ({
          ...pre,
          data: res.data,
          isLoading: false,
        }));
      })
      .catch((err) => {
        setOrganizationsData((pre) => ({ ...pre, isLoading: false }));
        console.log(err);
      });
    socket.on("documentVerificationUpdate", (data) => {
      setDocumentVerificationProgres((pre) => ({
        ...pre,
        ...data,
        verificationCompletedCount:
          data?.verificationType === "end" && !pre?.isUpdated
            ? pre?.verificationCompletedCount + 1
            : pre?.verificationCompletedCount,
        isUpdated: data?.verificationType === "end" ? true : false,
      }));
    });
  }, []);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Document Verification
      </Typography>
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
              {organizationsData?.isLoading &&
                organizationsData?.data?.length === 0 && (
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
              {organizationsData?.data?.map((item, i) => {
                return (
                  <MenuItem value={item.id} key={i}>
                    {/* <ListItemIcon sx={{ mr: 1 }}>
                      <Avatar src={item?.logo_url} />
                    </ListItemIcon> */}
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
              InputProps={{ disableUnderline: true }}
              required
              error={Boolean(folderOverviewData?.errorMsg)}
              helperText={
                folderOverviewData?.isLoading
                  ? "Please wait we are fetching folder info..."
                  : folderOverviewData?.errorMsg ||
                    folderOverviewData?.successMsg
              }
            />
            <Button
              variant="contained"
              sx={{ ml: 1 }}
              disabled={Boolean(
                documentVerificationData.isLoading ||
                  folderOverviewData.isLoading ||
                  folderOverviewData?.errorMsg ||
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
              totalCount={documentVerificationProgres?.totalFile}
              completedCount={
                documentVerificationProgres?.verificationCompletedCount
              }
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              {documentVerificationProgres?.verificationType === "start"
                ? `Starting ${documentVerificationProgres?.fileName} document verification...`
                : `Complete ${documentVerificationProgres?.fileName} document verification.`}
            </Typography>
          </Box>
        )}
        {documentVerificationData?.data?.files?.length > 0 && (
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
            <CSVLink
              data={documentVerificationData?.data?.files}
              className={classes.exportBtn}
              filename="document-verification-result"
            >
              <Button variant="contained">Export</Button>
            </CSVLink>
          </Box>
        )}
      </Box>
    </Box>
  );
}
