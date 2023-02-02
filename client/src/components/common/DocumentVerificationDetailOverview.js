import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect } from "react";
import { connect } from "react-redux";
import {
  getDocumentHashBlockchainProof,
  getExhibitBlockchainProof,
  getOrganizationExhibitBlockchainProof,
} from "../../redux/actions";
import BlockchainProof from "./BlockchainProof";

const useStyle = makeStyles((theme) => ({
  tableRow: {
    "&>td": {
      border: `1px solid ${theme.palette.borderColor}`,
    },
    "&:nth-child(even)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
  blockchainProofContainer: {
    "&>div:not(:last-child)": {
      marginBottom: 100,
      position: "relative",
      "&::before": {
        position: "absolute",
        content: "' '",
        width: 2,
        height: 100,
        backgroundColor: theme.palette.primary.main,
        top: "calc(100% + 2px)",
        left: " 50%",
        transform: "translateX(-50%)",
      },
      "&::after": {
        position: "absolute",
        content: "' '",
        width: 50,
        height: 50,
        top: "calc(100% + 25px)",
        backgroundColor: theme.palette.primary.main,
        outline: `2px solid ${theme.palette.common.white}`,
        borderRadius: "50%",
        left: "50%",
        transform: "translateX(-50%) scaleX(-1)",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='25' viewBox='0 0 20 25' fill='none' xmlns='http://www.w3.org/2000/svg' %3E%3Cpath d='M16.8664 10.1578H5.26193V6.74505C5.25926 4.39682 7.16921 2.48682 9.5145 2.48414C11.8627 2.48414 13.7727 4.39434 13.7754 6.73965C13.7781 6.98639 13.8779 7.21361 14.0415 7.3745C14.2051 7.53807 14.4269 7.63787 14.6763 7.63787H15.3611C15.86 7.63787 16.262 7.23584 16.262 6.7396H16.2594C16.2566 3.02188 13.2322 -0.00247373 9.51431 1.51829e-06C5.79678 0.00270885 2.77518 3.02733 2.77518 6.74505L2.77789 10.1578H2.31203C1.03401 10.1578 -0.00291464 11.1974 6.15529e-06 12.4754V22.6358C6.15529e-06 23.9139 1.03961 24.9508 2.31763 24.9508L16.728 24.9425C18.006 24.9425 19.043 23.9056 19.04 22.6275V12.4647C19.04 11.2365 18.078 10.2329 16.8665 10.158L16.8664 10.1578Z' fill='white' /%3E%3C/svg%3E")`,
      },
    },
  },
}));

export function DocumentVerificationDetailOverview({
  open = false,
  handleClose = () => {},
  data = {},
  getDocumentHashBlockchainProof,
  documentHashBlockchainProof,
  getExhibitBlockchainProof,
  getOrganizationExhibitBlockchainProof,
  exhibitBlockchainProof,
  organizationExhibitBlockchainProof,
}) {
  const classes = useStyle();
  useEffect(() => {
    if (open) {
      if (data?.integrantId) {
        getExhibitBlockchainProof({
          type: "integrant",
          id: data?.integrantId,
        });
      }
      if (data?.OrganizationExhibitId) {
        getOrganizationExhibitBlockchainProof({
          type: "organization_exhibit",
          id: data?.OrganizationExhibitId,
        });
      }
      if (data?.documentHashId) {
        getDocumentHashBlockchainProof({
          type: "document_hash",
          id: data?.documentHashId,
        });
      }
    }
  }, [open]);
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogContent>
        {data?.documentHashId && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Document Blockchain Proof
            </Typography>
            <Box className={classes.blockchainProofContainer}>
              {data?.integrantId ? (
                exhibitBlockchainProof?.isLoading ? (
                  <Typography
                    variant="body2"
                    display="flex"
                    alignItems={"center"}
                    justifyContent="center"
                  >
                    Please wait while we are fetching the product detail...
                    <CircularProgress size={20} sx={{ ml: 0.5 }} />
                  </Typography>
                ) : (
                  !exhibitBlockchainProof?.isError && (
                    <BlockchainProof blockchainProof={exhibitBlockchainProof} />
                  )
                )
              ) : null}
              {data?.OrganizationExhibitId &&
              !exhibitBlockchainProof?.isLoading ? (
                organizationExhibitBlockchainProof?.isLoading ? (
                  <Typography
                    variant="body2"
                    display="flex"
                    alignItems={"center"}
                    justifyContent="center"
                  >
                    Please wait while we are fetching the organization exhibit
                    detail...
                    <CircularProgress size={20} sx={{ ml: 0.5 }} />
                  </Typography>
                ) : (
                  !organizationExhibitBlockchainProof?.isError && (
                    <BlockchainProof
                      blockchainProof={organizationExhibitBlockchainProof}
                    />
                  )
                )
              ) : null}
              {data?.documentHashId &&
              !exhibitBlockchainProof?.isLoading &&
              !organizationExhibitBlockchainProof?.isLoading ? (
                documentHashBlockchainProof?.isLoading ? (
                  <Typography
                    variant="body2"
                    display="flex"
                    alignItems={"center"}
                    justifyContent="center"
                  >
                    Please wait while we are fetching the document detail...
                    <CircularProgress size={20} sx={{ ml: 0.5 }} />
                  </Typography>
                ) : (
                  !documentHashBlockchainProof?.isError && (
                    <BlockchainProof
                      blockchainProof={documentHashBlockchainProof}
                    />
                  )
                )
              ) : null}
              {!exhibitBlockchainProof?.isLoading &&
                !organizationExhibitBlockchainProof?.isLoading &&
                !documentHashBlockchainProof?.isLoading &&
                exhibitBlockchainProof?.isError &&
                organizationExhibitBlockchainProof?.isError &&
                documentHashBlockchainProof?.isError &&
                (data?.documentHashId ||
                  data?.integrantId ||
                  data?.OrganizationExhibitId) && (
                  <Typography
                    variant="body2"
                    display="flex"
                    alignItems={"center"}
                    justifyContent="center"
                  >
                    Something went wrong! we are not able to get blockchain
                    proof.
                  </Typography>
                )}
            </Box>
          </Box>
        )}
        <Typography variant="h6" sx={{ my: 1 }}>
          Document Verification Details
        </Typography>
        <Table>
          <TableBody>
            {Object.entries(data)
              ?.filter(
                ([key, value]) =>
                  ![
                    "documentHashId",
                    "OrganizationExhibitId",
                    "integrantId",
                  ].includes(key)
              )
              ?.map(([key, value], i) => (
                <TableRow key={i} className={classes.tableRow}>
                  <TableCell>{key}</TableCell>
                  <TableCell>{value}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const mapStateToProps = ({
  reducer: {
    documentHashBlockchainProof,
    exhibitBlockchainProof,
    organizationExhibitBlockchainProof,
  },
}) => ({
  documentHashBlockchainProof,
  exhibitBlockchainProof,
  organizationExhibitBlockchainProof,
});

const mapDispatchToProps = {
  getDocumentHashBlockchainProof,
  getExhibitBlockchainProof,
  getOrganizationExhibitBlockchainProof,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentVerificationDetailOverview);
