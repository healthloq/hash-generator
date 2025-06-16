import { Box, Button, Grid, Link, styled, Typography } from "@mui/material";
import React, { useState } from "react";
import ProductInfoDialog from "./ProductInfoDialog";

const HealthloqWidgetBlockchainProofBox = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.primary.main}`,
  borderRadius: 10,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  "& img": {
    marginLeft: 8,
  },
}));

const HealthloqWidgetProductInfoDiv = styled(Grid)({
  "& > div": {
    "&:first-child": {
      "& > *:not(:last-child)": {
        marginBottom: 16,
      },
    },
    "& > img": {
      width: "100%",
      height: "auto",
      maxWidth: 200,
      maxHeight: 200,
    },
  },
});

export default function BlockchainProof({ blockchainProof }) {
  const [openShowProofDialog, setOpenShowProofDialog] = useState(false);

  return (
    <HealthloqWidgetBlockchainProofBox>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Block Location
      </Typography>

      <Typography
        sx={{ wordBreak: "break-word" }}
        variant="body1"
        fontWeight={500}
        fontSize="1rem"
      >
        <strong>Block ID:</strong>{" "}
        <span style={{ fontSize: "1.1rem" }}>
          {blockchainProof?.blockAddress?.IonText}
        </span>
      </Typography>

      <Typography
        variant="h4"
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        sx={{ mt: 1, mb: 1 }}
        fontWeight={600}
      >
        Status: {blockchainProof?.result ? "Verified" : "Not Verified"}
        <img
          src={`${
            process.env.REACT_APP_HEALTHLOQ_CONSUMER_APP_BASE_URL
          }/assets/images/icon/${
            blockchainProof?.result ? "icon-correct.png" : "icon-wrong.png"
          }`}
          alt={blockchainProof?.result ? "correct-icon" : "wrong-icon"}
          style={{ marginLeft: 8 }}
        />
      </Typography>

      <HealthloqWidgetProductInfoDiv container spacing={2}>
        <Grid
          item
          xs={12}
          sm={blockchainProof?.data?.IntegrantTypeImageUrl ? 8 : 12}
        >
          {blockchainProof?.data?.type === "organization_exhibit" ? (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Document Information
              </Typography>
              <Typography variant="body2" fontSize="1rem">
                <strong>Document Name:</strong> {blockchainProof?.data?.title}
              </Typography>
              <Typography variant="body2" fontSize="1rem">
                <strong>Document ID:</strong> {blockchainProof?.data?.id}
              </Typography>
            </Box>
          ) : blockchainProof?.data?.type === "document_hash" ? (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Document Information
              </Typography>
              <Typography variant="body2" fontSize="1rem">
                <strong>Document ID:</strong> {blockchainProof?.data?.id}
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Product Information
              </Typography>
              <Typography variant="body2" fontSize="1rem">
                <strong>Product Name:</strong> {blockchainProof?.data?.Title}
              </Typography>
              <Typography variant="body2" fontSize="1rem">
                <strong>Batch ID:</strong> {blockchainProof?.data?.ExternalId}
              </Typography>
            </Box>
          )}

          <Box mt={1}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              Digitally Signed By
            </Typography>
            <Typography variant="body2" fontSize="1rem">
              <strong>Organization Name: </strong>
              <Link
                href={`${
                  process.env.REACT_APP_HEALTHLOQ_CONSUMER_APP_BASE_URL
                }/organization-detail/${
                  blockchainProof?.data?.OrganizationId ||
                  blockchainProof?.data?.organization_id
                }`}
                target="_blank"
                underline="hover"
                sx={(theme) => ({ color: theme.palette.primary.main })}
              >
                {blockchainProof?.data?.OrganizationName ||
                  blockchainProof?.data?.organization_name}
              </Link>
            </Typography>
            <Typography variant="body2" fontSize="1rem">
              <strong>Organization ID:</strong>{" "}
              {blockchainProof?.data?.OrganizationId ||
                blockchainProof?.data?.organization_id}
            </Typography>
          </Box>
        </Grid>

        {blockchainProof?.data?.IntegrantTypeImageUrl && (
          <Grid
            item
            xs={12}
            sm={4}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <img
              src={blockchainProof?.data?.IntegrantTypeImageUrl}
              alt="product-img"
            />
          </Grid>
        )}
      </HealthloqWidgetProductInfoDiv>

      <Box
        display="flex"
        alignItems="center"
        justifyContent="flex-start"
        mt={1}
      >
        <Button
          variant="contained"
          onClick={() => setOpenShowProofDialog(true)}
          sx={{borderRadius : 10}}
        >
          View More
        </Button>
      </Box>

      <ProductInfoDialog
        open={openShowProofDialog}
        handleClose={() => setOpenShowProofDialog(false)}
        data={blockchainProof?.data}
      />
    </HealthloqWidgetBlockchainProofBox>
  );
}
