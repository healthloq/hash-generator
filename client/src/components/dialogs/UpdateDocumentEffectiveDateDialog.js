import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { updateDocumentEffectiveDate } from "../../redux/actions";
import { connect } from "react-redux";
import { makeStyles } from "@mui/styles";

const useStyle = makeStyles((theme) => ({
  dialogContent: {
    "&>div": {
      padding: "20px 0",
    },
  },
  fileDiv: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    "&>img": {
      maxHeight: 150,
    },
    "&>label": {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
  },
  inputLabelRoot: {
    marginBottom: 5,
  },
  datePickerRoot: {
    zIndex: 1301,
  },
  dateTextField: {
    maxWidth: 400,
    width: "100%",
    "&>div": {
      minHeight: 40,
      padding: "0 15px",
    },
  },
}));

const UpdateDocumentEffectiveDateDialog = ({
  open = false,
  handleClose = () => {},
  selectedDocuments = [],
  setSelected = () => {},
  updateDocumentEffectiveDate,
  updateEffectiveDateData,
}) => {
  const classes = useStyle();
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
      <DialogContent className={classes.dialogContent}>
        <div>
          <TextField
            id="date"
            label="Effective Date"
            type="date"
            required
            InputLabelProps={{
              shrink: true,
            }}
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className={classes.dateTextField}
          />
        </div>
      </DialogContent>
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
