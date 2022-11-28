import React, { useEffect } from "react";
import { Body } from "../components/common";
import { Typography, Box, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ArrowForward } from "@mui/icons-material";
import { Link } from "../components";
import moment from "moment";
import { connect } from "react-redux";
import { getDashboardOverviewData } from "../redux/actions/dashboard";
import EnhancedTable from "../components/TableComponents";
import { syncedFilesHeaders } from "../constants/tableConfigs";

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

export function Home({ getDashboardOverviewData, dashboardOverview }) {
  const classes = useStyle();
  useEffect(() => {
    getDashboardOverviewData();
  }, []);
  return (
    <Body>
      <Box
        display="flex"
        alignItems={"center"}
        justifyContent={"space-between"}
        sx={{ mb: 3 }}
      >
        <Typography
          variant="h3"
          highlight="true"
          sx={{ textTransform: "capitalize" }}
        >
          <span>HealthLOQ</span> hash generator overview
        </Typography>
        <Link to="/document-verification" underline="none">
          <Button endIcon={<ArrowForward />} variant="contained">
            Go To Document Verification
          </Button>
        </Link>
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
      {/* <Typography variant="h4" sx={{ mb: 2 }}>
        Last few synced files
      </Typography> */}
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
      {/* <Box display="flex" flexDirection="column" className={classes.filesList}>
        {dashboardOverview?.data?.files?.map((file, key) => {
          return (
            <Box display="flex" flexDirection="column" key={key}>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={"flex-start"}
              >
                <Typography variant="h6">File Name:</Typography>
                <Typography variant="body2">{file?.fileName}</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={"flex-start"}
              >
                <Typography variant="h6">File Size:</Typography>
                <Typography variant="body2">{file?.state?.size}</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={"flex-start"}
              >
                <Typography variant="h6">File Path:</Typography>
                <Typography variant="body2">{file?.path}</Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={"flex-start"}
              >
                <Typography variant="h6">Created:</Typography>
                <Typography variant="body2">
                  {moment(file?.state?.birthtime).format("MM/DD/YYYY hh:mm A")}
                </Typography>
              </Box>
              <Box
                display="flex"
                alignItems="center"
                justifyContent={"flex-start"}
              >
                <Typography variant="h6">Modified:</Typography>
                <Typography variant="body2">
                  {moment(file?.state?.mtime).format("MM/DD/YYYY hh:mm A")}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box> */}
    </Body>
  );
}

const mapStateToProps = ({ DashboardReducer: { dashboardOverview } }) => ({
  dashboardOverview,
});

const mapDispatchToProps = {
  getDashboardOverviewData,
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
