import React, { useEffect, useState } from "react";
import { Body, MuiLinearProgress } from "../components/common";
import { Typography, Box, Button, Snackbar, IconButton } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ArrowForward } from "@mui/icons-material";
import { Link } from "../components";
import moment from "moment";
import { connect } from "react-redux";
import { getDashboardOverviewData } from "../redux/actions";
import EnhancedTable from "../components/TableComponents";
import { syncedFilesHeaders } from "../constants/tableConfigs";
import { abbrNum } from "../utils";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import UpdateDocumentEffectiveDateDialog from "../components/dialogs/UpdateDocumentEffectiveDateDialog";

const useStyle = makeStyles((theme) => ({
  lastsyncedData: {
    marginBottom: 30,
    "&>div": {
      "&>h6": {
        marginRight: 5,
      },
    },
  },
  filesList: {
    "&>div": {
      padding: 20,
      borderRadius: 10,
      border: `2px solid ${theme.palette.primary.main}`,
      marginBottom: 20,
      "&>div": {
        margin: "5px 0",
        "&>h6": {
          marginRight: 5,
        },
        "&>p": {},
      },
    },
  },
}));

export function Home({
  getDashboardOverviewData,
  dashboardOverview,
  subscriptionDetails,
  updateEffectiveDateData,
}) {
  const classes = useStyle();
  const [linearProgressData, setLinearProgressData] = useState({
    label: "",
    value: 0,
  });
  const [selected, setSelected] = useState([]);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [openUpdateEffectiveDateDialog, setOpenUpdateEffectiveDateDialog] =
    useState(false);
  const [publisherDataDashboard, setPublisherDataDashboard] = useState({});
  useEffect(() => {
    getDashboardOverviewData();
  }, []);
  useEffect(() => {
    if (subscriptionDetails?.data?.length) {
      const publisherData =
        subscriptionDetails?.data?.filter(
          (item) => item?.subscription_type === "publisher"
        )[0] || null;
      setPublisherDataDashboard(publisherData);
      if (publisherData)
        setLinearProgressData({
          label: `${abbrNum(
            parseInt(publisherData.current_num_monthly_hashes || "0")
          )}/${abbrNum(parseInt(publisherData.num_monthly_hashes || "0"))}`,
          value:
            (parseInt(publisherData.current_num_monthly_hashes || "0") * 100) /
            parseInt(publisherData.num_monthly_hashes || "0"),
        });
    }
  }, [subscriptionDetails]);

  useEffect(() => {
    if (
      !updateEffectiveDateData.isLoading &&
      updateEffectiveDateData?.message
    ) {
      setSnackbarMsg(updateEffectiveDateData?.message);
    }
  }, [updateEffectiveDateData]);
  return (
    <Body>
      <Box
        display="flex"
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{ mb: 3 }}
      >
        <Typography variant="h3" sx={{ textTransform: "capitalize" }}>
          Document Authenticator Dashboard
        </Typography>
        {subscriptionDetails?.subscriptionList?.includes("verifier") && (
          <Link to="/document-verification" underline="none">
            <Button endIcon={<ArrowForward />} variant="contained">
              Go To Document Verifier
            </Button>
          </Link>
        )}
      </Box>
      <Box
        display={"flex"}
        flexDirection="column"
        className={classes.lastsyncedData}
      >
        <Box display="flex" alignItems="center" justifyContent={"flex-start"}>
          <Typography variant="h6">Last synced:</Typography>
          <Typography variant="body2">
            {moment(dashboardOverview?.data?.lastSyncedDate).format(
              "MM/DD/YYYY hh:mm A"
            )}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent={"flex-start"}>
          <Typography variant="h6">Total Files:</Typography>
          <Typography variant="body2">
            {dashboardOverview?.data?.totalFiles}
          </Typography>
        </Box>
      </Box>
      {(!publisherDataDashboard?.organization?.ignore_threshold ||
        publisherDataDashboard?.organization?.ignore_threshold === 0) && (
        <Box sx={{ my: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Your current month document publish limit overview
          </Typography>
          <MuiLinearProgress
            {...{
              loading: subscriptionDetails?.isLoading,
              ...linearProgressData,
            }}
          />
        </Box>
      )}
      <EnhancedTable
        tableTitle="Synced Files"
        headCells={syncedFilesHeaders}
        rows={dashboardOverview?.filteredFiles?.map((file) => ({
          fileName: file?.fileName,
          fileSize: file?.state?.size,
          filePath: file?.path,
          created: moment(file?.state?.birthtime).format("MM/DD/YYYY hh:mm A"),
          modified: moment(file?.state?.mtime).format("MM/DD/YYYY hh:mm A"),
          effective_date: file?.effective_date
            ? moment(file?.effective_date).format("MM/DD/YYYY")
            : "",
          id: file?.hash,
        }))}
        tableId="syncedFilesFilter"
        isLoading={dashboardOverview?.isLoading}
        showCheckbox
        selected={selected}
        setSelected={setSelected}
        getBulkActionInfo={
          <>
            <Button
              startIcon={<EditIcon />}
              variant="contained"
              onClick={() => setOpenUpdateEffectiveDateDialog(true)}
            >
              Edit Effective Date
            </Button>
          </>
        }
      />
      <UpdateDocumentEffectiveDateDialog
        open={openUpdateEffectiveDateDialog}
        handleClose={() => {
          setSelected([]);
          setOpenUpdateEffectiveDateDialog(false);
        }}
        selectedDocuments={selected}
        setSelected={setSelected}
      />
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(snackbarMsg)}
        onClose={() => setSnackbarMsg("")}
        message={snackbarMsg}
        autoHideDuration={6000}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSnackbarMsg("")}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </Body>
  );
}

const mapStateToProps = ({
  reducer: { dashboardOverview, subscriptionDetails, updateEffectiveDateData },
}) => ({
  dashboardOverview,
  subscriptionDetails,
  updateEffectiveDateData,
});

const mapDispatchToProps = {
  getDashboardOverviewData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
