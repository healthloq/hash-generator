import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Body } from "../components/common";
import DocumentVerifier from "../components/Home/DocumentVerifier";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "../components";
import { ArrowBack } from "@mui/icons-material";
import { setInitialState, getSubscriptionOverview } from "../redux/actions";
import { MuiLinearProgress } from "../components/common";
import { numberWithCommas } from "../utils";

export const DocumentVerification = (props) => {
  const {
    setInitialState,
    getSubscriptionOverview,
    subscriptionDetails,
    documentVerificationData,
  } = props;
  const [linearProgressData, setLinearProgressData] = useState({
    label: "",
    value: 0,
  });
  useEffect(() => {
    if (documentVerificationData.isDocVerificationFinalOverview) {
      getSubscriptionOverview();
    }
  }, [documentVerificationData.isDocVerificationFinalOverview]);

  useEffect(() => {
    if (subscriptionDetails?.data?.length) {
      const verifierData =
        subscriptionDetails?.data?.filter(
          (item) => item?.subscription_type === "verifier"
        )[0] || null;
      if (verifierData)
        setLinearProgressData({
          label: `${numberWithCommas(
            parseInt(verifierData.current_num_daily_hashes)
          )}/${numberWithCommas(parseInt(verifierData.num_daily_hashes))}`,
          value:
            (parseInt(verifierData.current_num_daily_hashes) * 100) /
            parseInt(verifierData.num_daily_hashes),
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
            <Button startIcon={<ArrowBack />} variant="contained">
              Back
            </Button>
          </Link>
        )}
      </Box>
      <Box sx={{ my: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Your today's document verification limit overview
        </Typography>
        <MuiLinearProgress
          {...{
            loading: subscriptionDetails?.isLoading,
            ...linearProgressData,
          }}
        />
      </Box>
      <DocumentVerifier />
    </Body>
  );
};

const mapStateToProps = ({
  reducer: { subscriptionDetails, documentVerificationData },
}) => ({
  subscriptionDetails,
  documentVerificationData,
});

const mapDispatchToProps = {
  setInitialState,
  getSubscriptionOverview,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentVerification);
