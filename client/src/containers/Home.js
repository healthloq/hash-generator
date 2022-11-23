import React, { useEffect, useState } from "react";
import { Body } from "../components/common";
import { Typography, makeStyles, Box } from "../components";
import axios from "axios";
import { DocumentVerification } from "../components/Home";
import moment from "moment";

const useStyle = makeStyles((theme) => ({
  homeContainer: {
    padding: "40px 0",
    "&>h3": {
      textTransform: "capitalize",
    },
  },
  lastsyncedData: {
    margin: "30px 0",
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

export default function Home() {
  const classes = useStyle();
  const [data, setData] = useState(null);
  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/dashboard/overview-data`)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <Body>
      <Box className={classes.homeContainer}>
        <Typography variant="h3" highlight="true">
          <span>HealthLOQ</span> hash generator overview
        </Typography>
        <Box
          display={"flex"}
          flexDirection="column"
          className={classes.lastsyncedData}
        >
          <Box display="flex" alignItems="center" justifyContent={"flex-start"}>
            <Typography variant="h6">Last synced:</Typography>
            <Typography variant="body2">
              {moment(data?.lastSyncedDate).format("MM/DD/YYYY hh:mm A")}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" justifyContent={"flex-start"}>
            <Typography variant="h6">Total Files:</Typography>
            <Typography variant="body2">{data?.totalFiles}</Typography>
          </Box>
        </Box>
        <DocumentVerification />
        <Typography variant="h4" sx={{ mb: 2 }}>
          Last few synced files
        </Typography>
        <Box
          display="flex"
          flexDirection="column"
          className={classes.filesList}
        >
          {data?.files?.map((file, key) => {
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
                    {moment(file?.state?.birthtime).format(
                      "MM/DD/YYYY hh:mm A"
                    )}
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
        </Box>
      </Box>
    </Body>
  );
}
