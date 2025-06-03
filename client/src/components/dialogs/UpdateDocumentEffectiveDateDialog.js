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
  Select,
  MenuItem,
} from "@mui/material";
import {
  getOrganizationListMetaData,
  getOrganizationLocationMetaData,
  getProductBatchListMetaData,
  getProductListMetaData,
  updateDocumentEffectiveDate,
} from "../../redux/actions";
import { connect } from "react-redux";

const PrimaryDialogContent = styled(DialogContent)(({ theme }) => ({
  "&>div": {
    padding: "20px 0",
  },
}));

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
  handleClose = () => {},
  selectedDocuments = [],
  setSelected = () => {},
  updateDocumentEffectiveDate,
  updateEffectiveDateData,
  getOrganizationListMetaData,
  organizationListMetaData,
  getOrganizationLocationMetaData,
  organizationLocationListMetaData,
  getProductListMetaData,
  getProductBatchListMetaData,
  productListMetaData,
  productBatchListMetaData,
}) => {
  const [effectiveDate, setEffectiveDate] = useState("");
  const [selectOption, setSelectOption] = useState({
    organization_id: null,
    location_id: null,
    product_id: null,
    product_batch_id: null,
  });
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
      getOrganizationListMetaData();
    }
  }, [open]);

  const handleSelectOrganization = async (event) => {
    const { value } = event.target;
    await getOrganizationLocationMetaData({ organization_id: value });
    setSelectOption((prev) => ({
      organization_id: value,
    }));
  };

  const handleSelectLocation = async (event) => {
    const { value } = event.target;
    await getProductListMetaData({
      organization_id: selectOption.organization_id,
      location_id: value,
    });
    setSelectOption((prev) => ({
      ...prev,
      location_id: value,
    }));
  };

  const handleSelectProduct = async (event) => {
    const { value } = event.target;

    await getProductBatchListMetaData({
      integrant_type_id: value,
      organization_id: selectOption.organization_id,
      offset: 0,
      limit: null,
    });

    setSelectOption((prev) => ({
      ...prev,
      product_id: value,
    }));
  };

  const handleSelectProductBatch = async (event) => {
    const { value } = event.target;
    setSelectOption((prev) => ({
      ...prev,
      product_batch_id: value,
    }));
  };
  return (
    <Dialog open={open} fullWidth maxWidth="sm">
      <DialogTitle className="dialog-title">Edit File Metadata</DialogTitle>
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
        <div>
          <Select
            label="Organization"
            fullWidth
            value={selectOption.organization_id}
            onChange={handleSelectOrganization}
            MenuProps={{
              anchorOrigin: {
                vertical: "top",
                horizontal: "right",
              },
              transformOrigin: {
                vertical: "top",
                horizontal: "right",
              },
            }}
          >
            {(organizationListMetaData.data || []).map((org) => (
              <MenuItem value={org.id}>{org.name}</MenuItem>
            ))}
          </Select>
        </div>

        {selectOption.organization_id &&
          Array.isArray(organizationLocationListMetaData.data) && (
            <Select
              label="Location"
              fullWidth
              value={selectOption.location_id}
              onChange={handleSelectLocation}
              MenuProps={{
                anchorOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
              }}
            >
              {(organizationLocationListMetaData.data || []).map((location) => (
                <MenuItem value={location.id}>
                  {location.description} - {location.line_1} {location.line_2}{" "}
                  {location.city}
                </MenuItem>
              ))}
            </Select>
          )}

        {selectOption.organization_id &&
          selectOption.location_id &&
          Array.isArray(productListMetaData.data) && (
            <Select
              label="Product"
              fullWidth
              value={selectOption.product_id}
              onChange={handleSelectProduct}
              MenuProps={{
                anchorOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
              }}
            >
              {(productListMetaData.data || []).map((product) => (
                <MenuItem value={product.id}>{product.title}</MenuItem>
              ))}
            </Select>
          )}

        {selectOption.organization_id &&
          selectOption.location_id &&
          selectOption.product_id &&
          Array.isArray(productBatchListMetaData.data) && (
            <Select
              label="Product"
              fullWidth
              value={selectOption.product_batch_id}
              onChange={handleSelectProductBatch}
              MenuProps={{
                anchorOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
              }}
            >
              {(productBatchListMetaData.data || []).map((product) => (
                <MenuItem value={product.id}>{product.external_id}</MenuItem>
              ))}
            </Select>
          )}
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

const mapStateToProps = ({
  reducer: {
    updateEffectiveDateData,
    organizationListMetaData,
    organizationLocationListMetaData,
    productListMetaData,
    productBatchListMetaData,
  },
}) => ({
  updateEffectiveDateData,
  organizationListMetaData,
  organizationLocationListMetaData,
  productListMetaData,
  productBatchListMetaData,
});

const mapDispatchToProps = {
  getOrganizationListMetaData,
  updateDocumentEffectiveDate,
  getOrganizationLocationMetaData,
  getProductListMetaData,
  getProductBatchListMetaData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateDocumentEffectiveDateDialog);
