import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Body } from "../components/common";
import DocumentVerifier from "../components/Home/DocumentVerifier";
import DocumentVerifierNewDesign from "../components/Home/DocumentVeriferNewDesign";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from "@mui/material";
import { Link } from "../components";
import ArrowBack from "@mui/icons-material/ArrowBack";
import {
  setInitialState,
  getSubscriptionOverview,
  getOrganizationList,
  setApiFlagsInitialState,
} from "../redux/actions";
// import { MuiLinearProgress } from "../components/common";
import { abbrNum, numberWithCommas } from "../utils";
import ProgressIndicator from "../components/common/ProgressIndicator";
import { ApexChart } from "../components/graph/PieChart";
import DocumentTableView from "../components/Home/DocumentTableView";

export const DocumentVerification = (props) => {
  const {
    setInitialState,
    getSubscriptionOverview,
    subscriptionDetails,
    getOrganizationList,
    apiFlags,
    setApiFlagsInitialState,
    getVerifyDocumentCount,
    folderOverview,
  } = props;
  const [linearProgressData, setLinearProgressData] = useState({
    label: "",
    value: 0,
  });
  const [progressBarData, setProgressBarData] = useState({
    value: 0,
    max: 0,
  });

  useEffect(() => {
    if (apiFlags.subscriptionDetailFlag) {
      getSubscriptionOverview();
      setApiFlagsInitialState(["subscriptionDetailFlag"]);
    }
  }, [apiFlags.subscriptionDetailFlag]);

  useEffect(() => {
    getOrganizationList();
  }, []);

  useEffect(() => {
    if (subscriptionDetails?.data?.length) {
      const verifierData =
        subscriptionDetails?.data?.filter(
          (item) => item?.subscription_type === "verifier"
        )[0] || null;
      if (verifierData)
        setProgressBarData({
          value: verifierData.current_num_monthly_hashes,
          max: verifierData.num_monthly_hashes,
        });
      setLinearProgressData({
        label: `${numberWithCommas(
          parseInt(verifierData.current_num_monthly_hashes || "0")
        )}/${abbrNum(parseInt(verifierData.num_monthly_hashes || "0"))}`,
        value:
          (parseInt(verifierData.current_num_monthly_hashes || "0") * 100) /
          parseInt(verifierData.num_monthly_hashes || "0"),
      });
    }
  }, [subscriptionDetails]);

  const [doucmentCount, setDocumentCount] = useState({
    verifiedDocWithVerifyOrg: null,
    verifedDocWithUnVerifedOrg: null,
    unVerifedDoc: null,
  });

  useEffect(() => {
    setDocumentCount(() => ({
      verifiedDocWithVerifyOrg:
        getVerifyDocumentCount?.data?.noOfVerifiedDocumentsWithVerifiedOrg ||
        folderOverview?.count?.noOfVerifiedDocumentsWithVerifiedOrg,
      verifedDocWithUnVerifedOrg:
        getVerifyDocumentCount?.data?.noOfVerifiedDocumentsWithUnVerifiedOrg ||
        folderOverview?.count?.noOfVerifiedDocumentsWithUnVerifiedOrg,
      unVerifedDoc:
        getVerifyDocumentCount?.data?.noOfUnverifiedDocuments ||
        folderOverview?.count?.noOfUnverifiedDocuments,
    }));
  }, [getVerifyDocumentCount, folderOverview]);
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
          Document Verifier Dashboard
        </Typography>
        {subscriptionDetails?.subscriptionList?.includes("publisher") && (
          <Link
            to="/"
            underline="none"
            onClick={() =>
              setInitialState(["documentVerificationData", "folderOverview"])
            }
          >
            <Button startIcon={<ArrowBack />}>Back</Button>
          </Link>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Card
          sx={{
            boxShadow: 5,
            width: "100%",
            borderRadius: "8px",
          }}
        >
          <CardContent>
            <Grid sx={{ display: "flex", gap: 2, marginBottom: "25px" }}>
              <Grid>
                <Typography variant="h5">Overview</Typography>
                <Typography variant="body2" margin="10px 0px">
                  Your current month document verification limit overview
                </Typography>
              </Grid>

              <Grid>
                <ProgressIndicator
                  max={progressBarData.max}
                  value={progressBarData.value}
                />
              </Grid>
            </Grid>
            <DocumentVerifierNewDesign />
          </CardContent>
        </Card>

        <Card
          sx={{
            width: "100%",
            borderRadius: "8px",
            boxShadow: 5,
          }}
        >
          <CardContent>
            {Object.values(doucmentCount).some(
              (data) => data !== undefined && data !== null && data !== 0
            ) ? (
              <>
                <Typography sx={{ marginBottom: 2 }} variant="h5">
                  Document Verification Status
                </Typography>
                <ApexChart doucmentCount={doucmentCount} />
              </>
            ) : (
              <Grid
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "325px",
                  textAlign: "center",
                }}
              >
                <Typography variant="h5">
                The document overview will appear here once you verify the document or select an existing folder path
                </Typography>
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
      {/* <DocumentVerifier /> */}
      <DocumentTableView />
    </Body>
  );
};

const mapStateToProps = ({
  reducer: {
    subscriptionDetails,
    apiFlags,
    getVerifyDocumentCount,
    folderOverview,
  },
}) => ({
  subscriptionDetails,
  apiFlags,
  getVerifyDocumentCount,
  folderOverview,
});

const mapDispatchToProps = {
  setInitialState,
  getSubscriptionOverview,
  getOrganizationList,
  setApiFlagsInitialState,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentVerification);
