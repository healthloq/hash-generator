import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";

const StyledDialog = styled(Dialog)`
  .MuiDialog-paper {
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    min-width: 800px;
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  background-color: #f4f6f9;
  border-bottom: 1px solid #ddd;
`;

const StyledTableContainer = styled(TableContainer)`
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
`;

const StyledTable = styled(Table)`
  min-width: 600px;
`;

const StyledTableHead = styled(TableHead)`
  background-color: #eaf7ed;
  font-weight: bold;
`;

const StyledTableCell = styled(TableCell)`
  font-weight: bold;
  text-align: center;
  border-bottom: 1px solid #ddd;
`;

const StyledTableRow = styled(TableRow)`
  &:nth-of-type(odd) {
    background-color: #f9f9f9;
  }
  &:nth-of-type(even) {
    background-color: #ffffff;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  justify-content: flex-end;
`;

// const StyledButton = styled(Button)`
//   color: #007bff;
//   border-color: #007bff;
//   &:hover {
//     background-color: #007bff;
//     color: white;
//   }
// `;

const ShowCertificateModal = ({
  title = "",
  handleClose = () => {},
  data = [],
  open = false,
}) => {
  return (
    <StyledDialog open={open} onClose={handleClose}>
      <StyledDialogTitle>{title}</StyledDialogTitle>
      <DialogContent>
        <StyledTableContainer component={Paper}>
          <StyledTable>
            <StyledTableHead>
              <TableRow>
                <StyledTableCell>Certificate Name</StyledTableCell>
                <StyledTableCell>Authentic Document</StyledTableCell>
                <StyledTableCell>Effective Date</StyledTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {Array.isArray(data) &&
                data.map((certificate, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>{certificate?.title}</StyledTableCell>
                    <StyledTableCell>
                      {new Date(certificate?.effective_date) > new Date()
                        ? "Pass"
                        : "Fail"}
                    </StyledTableCell>
                    <StyledTableCell>
                      {new Date(certificate?.effective_date).toLocaleDateString(
                        "en-US",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      </DialogContent>
      <StyledDialogActions>
        <Button variant="outlined" onClick={handleClose}>
          Close
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default ShowCertificateModal;
