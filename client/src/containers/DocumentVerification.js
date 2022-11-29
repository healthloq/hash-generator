import React from "react";
import { connect } from "react-redux";
import { Body } from "../components/common";
import DocumentVerifier from "../components/Home/DocumentVerifier";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "../components";
import { ArrowBack } from "@mui/icons-material";
import { setInitialState } from "../redux/actions";

export const DocumentVerification = (props) => {
  const { setInitialState } = props;
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
          Document Verification
        </Typography>
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
      </Box>
      <DocumentVerifier />
    </Body>
  );
};

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {
  setInitialState,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentVerification);
