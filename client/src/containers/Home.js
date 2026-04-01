import React, { useEffect, useState } from "react";
import { Body, MuiLinearProgress } from "../components/common";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Snackbar,
  IconButton,
  styled,
  Divider,
} from "@mui/material";
import moment from "moment";
import { connect } from "react-redux";
import { getDashboardOverviewData } from "../redux/actions";
import EnhancedTable from "../components/TableComponents";
import { syncedFilesHeaders } from "../constants/tableConfigs";
import { abbrNum } from "../utils";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import UpdateDocumentEffectiveDateDialog from "../components/dialogs/UpdateDocumentEffectiveDateDialog";
import AutoPopulateMetadataDialog from "../components/dialogs/AutoPopulateMetadataDialog";

export function Home({
  getDashboardOverviewData,
  dashboardOverview,
  subscriptionDetails,
  updateEffectiveDateData,
}) {
  const [linearProgressData, setLinearProgressData] = useState({
    label: "",
    value: 0,
  });
  const [selected, setSelected] = useState([]);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [openUpdateEffectiveDateDialog, setOpenUpdateEffectiveDateDialog] =
    useState(false);
  const [openAutoPopulateDialog, setOpenAutoPopulateDialog] = useState(false);
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
  const showThreshold =
    !publisherDataDashboard?.organization?.ignore_threshold ||
    publisherDataDashboard?.organization?.ignore_threshold === 0;

  return (
    <Body>
      {/* Header tile — matches Card style used in DocumentVerification */}
      <Card sx={{ mb: 3, boxShadow: 5, borderRadius: "8px" }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Last Synced
              </Typography>
              <Typography variant="h6">
                {dashboardOverview?.data?.lastSyncedDate
                  ? moment(dashboardOverview.data.lastSyncedDate).format("MM/DD/YYYY h:mm A")
                  : "—"}
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Files
              </Typography>
              <Typography variant="h6">
                {dashboardOverview?.data?.totalFiles ?? "—"}
              </Typography>
            </Box>
            {showThreshold && (
              <>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Document Limit
                  </Typography>
                  <MuiLinearProgress
                    loading={subscriptionDetails?.isLoading}
                    {...linearProgressData}
                  />
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
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
          organization_name: file.organization_name ?? "-",
          location_name: file.location_name ?? "-",
          product_name: file.product_name ?? "-",
          product_batch_name: file.product_batch_name ?? "-",
          expiration_date: file?.expiration_date
            ? moment(file?.expiration_date).format("MM/DD/YYYY")
            : "-",
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
              Edit File Metadata
            </Button>
            <Button
              startIcon={<AutoAwesomeIcon />}
              variant="outlined"
              onClick={() => setOpenAutoPopulateDialog(true)}
              sx={{ ml: 1 }}
            >
              Auto-populate Metadata
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
        dashboardOverview={dashboardOverview}
      />
      <AutoPopulateMetadataDialog
        open={openAutoPopulateDialog}
        onClose={() => {
          setOpenAutoPopulateDialog(false);
        }}
        selectedHashes={selected}
        onComplete={() => {
          setSelected([]);
          getDashboardOverviewData();
        }}
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
