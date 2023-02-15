import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { Body } from "../components/common";
import DocumentVerifier from "../components/Home/DocumentVerifier";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "../components";
import { ArrowBack } from "@mui/icons-material";
import {
  setInitialState,
  getSubscriptionOverview,
  getOrganizationList,
  setApiFlagsInitialState,
} from "../redux/actions";
import { MuiLinearProgress } from "../components/common";
import { abbrNum, numberWithCommas } from "../utils";

export const DocumentVerification = (props) => {
  const {
    setInitialState,
    getSubscriptionOverview,
    subscriptionDetails,
    getOrganizationList,
    apiFlags,
    setApiFlagsInitialState,
  } = props;
  const [linearProgressData, setLinearProgressData] = useState({
    label: "",
    value: 0,
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
        setLinearProgressData({
          label: `${numberWithCommas(
            parseInt(verifierData.current_num_daily_hashes)
          )}/${abbrNum(parseInt(verifierData.num_daily_hashes))}`,
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
            <Button startIcon={<ArrowBack />}>Back</Button>
          </Link>
        )}
      </Box>
      <Box>
        <Button
          variant="contained"
          href={`${process.env.REACT_APP_HEALTHLOQ_PRODUCER_APP_BASE_URL}/ingredient-comparision`}
          target="_blank"
          color="primary"
        >
          Compare Ingredients
        </Button>
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

const mapStateToProps = ({ reducer: { subscriptionDetails, apiFlags } }) => ({
  subscriptionDetails,
  apiFlags,
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
