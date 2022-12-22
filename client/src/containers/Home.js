import React, { useEffect, useState } from "react";
import { Body, MuiLinearProgress } from "../components/common";
import { Typography, Box, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ArrowForward } from "@mui/icons-material";
import { Link } from "../components";
import moment from "moment";
import { connect } from "react-redux";
import { getDashboardOverviewData } from "../redux/actions";
import EnhancedTable from "../components/TableComponents";
import { syncedFilesHeaders } from "../constants/tableConfigs";
import { numberWithCommas } from "../utils";

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
}) {
  const classes = useStyle();
  const [linearProgressData, setLinearProgressData] = useState({
    label: "",
    value: 0,
  });
  useEffect(() => {
    getDashboardOverviewData();
  }, []);
  useEffect(() => {
    if (subscriptionDetails?.data?.length) {
      const publisherData =
        subscriptionDetails?.data?.filter(
          (item) => item?.subscription_type === "publisher"
        )[0] || null;
      if (publisherData)
        setLinearProgressData({
          label: `${numberWithCommas(
            parseInt(publisherData.current_num_daily_hashes)
          )}/${numberWithCommas(parseInt(publisherData.num_daily_hashes))}`,
          value:
            (parseInt(publisherData.current_num_daily_hashes) * 100) /
            parseInt(publisherData.num_daily_hashes),
        });
    }
  }, [subscriptionDetails]);
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
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Your today's document publish limit overview
        </Typography>
        <MuiLinearProgress
          {...{
            loading: subscriptionDetails?.isLoading,
            ...linearProgressData,
          }}
        />
      </Box>
      <EnhancedTable
        tableTitle="Synced Files"
        headCells={syncedFilesHeaders}
        rows={dashboardOverview?.filteredFiles?.map((file) => ({
          fileName: file?.fileName,
          fileSize: file?.state?.size,
          filePath: file?.path,
          created: moment(file?.state?.birthtime).format("MM/DD/YYYY hh:mm A"),
          modified: moment(file?.state?.mtime).format("MM/DD/YYYY hh:mm A"),
        }))}
        tableId="syncedFilesFilter"
        isLoading={dashboardOverview?.isLoading}
      />
    </Body>
  );
}

const mapStateToProps = ({
  reducer: { dashboardOverview, subscriptionDetails },
}) => ({
  dashboardOverview,
  subscriptionDetails,
});

const mapDispatchToProps = {
  getDashboardOverviewData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
