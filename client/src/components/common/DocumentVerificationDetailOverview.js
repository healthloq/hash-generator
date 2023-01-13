import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

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

export default function DocumentVerificationDetailOverview({
  open = false,
  handleClose = () => {},
  data = {},
}) {
  const classes = useStyle();
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>Document Verification Detail Overview</DialogTitle>
      <DialogContent>
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
