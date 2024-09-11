import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
  styled,
} from "@mui/material";
import { updateDocumentEffectiveDate } from "../../redux/actions";
import { connect } from "react-redux";

const PrimaryDialogContent = styled(DialogContent)(({ theme }) => ({
  "&>div": {
    padding: "20px 0",
  },
}))

const DateTextField = styled(TextField)(({ theme }) => ({
  maxWidth: 400,
  width: "100%",
  "&>div": {
    minHeight: 40,
    padding: "0 15px",
  },
}))
const UpdateDocumentEffectiveDateDialog = ({
  open = false,
  handleClose = () => { },
  selectedDocuments = [],
  setSelected = () => { },
  updateDocumentEffectiveDate,
  updateEffectiveDateData,
}) => {
  const [effectiveDate, setEffectiveDate] = useState("");

  const handleSubmit = async () => {
    await updateDocumentEffectiveDate({
      effective_date: effectiveDate,
      hashList: selectedDocuments,
    });
    setSelected([]);
    handleClose();
  };

  useEffect(() => {
    if (open) {
      setEffectiveDate("");
    }
  }, [open]);

  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle className="dialog-title">
        Update Document Effective Date
      </DialogTitle>
      <PrimaryDialogContent>
        <div>
          <DateTextField
            id="date"
            label="Effective Date"
            type="date"
            required
            InputLabelProps={{
              shrink: true,
            }}
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        </div>
      </PrimaryDialogContent>
      <DialogActions className="dialog-actions">
        <Button
          variant="outlined"
          disabled={updateEffectiveDateData?.isLoading}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={updateEffectiveDateData?.isLoading || !effectiveDate}
          type="submit"
          onClick={handleSubmit}
          endIcon={
            updateEffectiveDateData?.isLoading ? (
              <CircularProgress size={20} sx={{ color: "white" }} />
            ) : null
          }
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = ({ reducer: { updateEffectiveDateData } }) => ({
  updateEffectiveDateData,
});

const mapDispatchToProps = {
  updateDocumentEffectiveDate,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateDocumentEffectiveDateDialog);
