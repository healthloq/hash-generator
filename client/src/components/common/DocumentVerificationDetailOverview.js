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
import { getDocumentHashBlockchainProof } from "../../redux/actions";
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
}));

export function DocumentVerificationDetailOverview({
  open = false,
  handleClose = () => {},
  data = {},
  getDocumentHashBlockchainProof,
  documentHashBlockchainProof,
}) {
  const classes = useStyle();
  useEffect(() => {
    if (open && data?.documentHashId) {
      getDocumentHashBlockchainProof({
        type: "document_hash",
        id: data?.documentHashId,
      });
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
            {documentHashBlockchainProof?.isLoading ? (
              <Typography
                variant="body2"
                display="flex"
                alignItems={"center"}
                justifyContent="center"
              >
                Please wait while we are fetching the document detail...
                <CircularProgress size={20} sx={{ ml: 0.5 }} />
              </Typography>
            ) : documentHashBlockchainProof?.isError ? (
              <Typography
                variant="body2"
                display="flex"
                alignItems={"center"}
                justifyContent="center"
              >
                Something went wrong! We are not able to get blockchain proof.
              </Typography>
            ) : (
              <BlockchainProof blockchainProof={documentHashBlockchainProof} />
            )}
          </Box>
        )}
        <Typography variant="h6" sx={{ my: 1 }}>
          Document Verification Details
        </Typography>
        <Table>
          <TableBody>
            {Object.entries(data)?.map(([key, value], i) => (
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

const mapStateToProps = ({ reducer: { documentHashBlockchainProof } }) => ({
  documentHashBlockchainProof,
});

const mapDispatchToProps = {
  getDocumentHashBlockchainProof,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DocumentVerificationDetailOverview);
