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
  FormControl,
  InputLabel,
  Grid,
} from "@mui/material";
import {
  getDashboardOverviewData,
  getOrganizationListMetaData,
  getOrganizationLocationMetaData,
  getProductBatchListMetaData,
  getProductListMetaData,
  resetMetaDataState,
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
}));

const SelectBoxDiv = styled(Grid)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
}));
const UpdateDocumentEffectiveDateDialog = ({
  open = false,
  handleClose = () => {},
  selectedDocuments = [],
  setSelected = () => {},
  dashboardOverview,
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
  resetMetaDataState,
  getDashboardOverviewData,
}) => {
  const [effectiveDate, setEffectiveDate] = useState("");
  const [selectOption, setSelectOption] = useState({
    organization_id: '',
    location_id: '',
    product_id: '',
    product_batch_id: '',
  });
  const handleSubmit = async () => {
    await updateDocumentEffectiveDate({
      effective_date: effectiveDate,
      hashList: selectedDocuments,
      meta_data_org_id: selectOption.organization_id ?? null,
      meta_data_org_location_id: selectOption.location_id ?? null,
      meta_data_product_id: selectOption.product_id ?? null,
      meta_data_product_batch_id: selectOption.product_batch_id ?? null,
    });
    await getDashboardOverviewData();
    setSelected([]);
    handleClose();
  };

  const addPreviousData = async (findDocument) => {
    const { organization_id, location_id, product_id, product_batch_id } =
      findDocument;

    setSelectOption({
      organization_id,
      location_id,
      product_id,
      product_batch_id,
    });

    if (organization_id) {
      getOrganizationLocationMetaData({ organization_id });
      getProductListMetaData({ organization_id });
    }

    if (product_id) {
      getProductBatchListMetaData({
        integrant_type_id: product_id,
        organization_id,
        offset: 0,
        limit: null,
      });
    }
  };

  useEffect(() => {
    if (open) {
      setEffectiveDate("");
      getOrganizationListMetaData();
      resetMetaDataState();
      if (selectedDocuments.length === 1) {
        const findDocument = (dashboardOverview.filteredFiles || []).find(
          (file) => file.hash === selectedDocuments[0]
        );

        addPreviousData(findDocument);
      } else {
        setSelectOption({
          organization_id: null,
          location_id: null,
          product_id: null,
          product_batch_id: null,
        });
      }
    }
  }, [open]);

  const handleSelectOrganization = async (event) => {
    const { value } = event.target;
    setSelectOption((prev) => ({
      organization_id: value,
    }));
    resetMetaDataState();
    await getOrganizationLocationMetaData({ organization_id: value });
    await getProductListMetaData({
      organization_id: value,
    });
  };

  const handleSelectLocation = async (event) => {
    const { value } = event.target;
    setSelectOption((prev) => ({
      ...prev,
      location_id: value,
    }));
  };

  const handleSelectProduct = async (event) => {
    const { value } = event.target;

    setSelectOption((prev) => ({
      ...prev,
      product_id: value,
    }));
    await getProductBatchListMetaData({
      integrant_type_id: value,
      organization_id: selectOption.organization_id,
      offset: 0,
      limit: null,
    });
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
        <SelectBoxDiv>
          <FormControl fullWidth>
            <InputLabel id="organization-label">Organization</InputLabel>
            <Select
              labelId="organization-label"
              value={selectOption.organization_id}
              onChange={handleSelectOrganization}
              label="Organization"
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    overflowY: "auto",
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {organizationListMetaData?.data?.length > 0 ? (
                (organizationListMetaData.data || []).map((org) => (
                  <MenuItem key={org.id} value={org.id}>
                    {org.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value={null}>
                  Organization Not found
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {organizationListMetaData.isLoading && <CircularProgress size={20} />}
        </SelectBoxDiv>

        <SelectBoxDiv>
          <FormControl fullWidth>
            <InputLabel>Organization Location</InputLabel>
            <Select
              label="Organization Location"
              fullWidth
              value={selectOption.location_id}
              onChange={handleSelectLocation}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    overflowY: "auto",
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {organizationLocationListMetaData?.data?.length > 0 ? (
                (organizationLocationListMetaData.data || []).map(
                  (location) => (
                    <MenuItem key={location.id} value={location.id}>
                      {location.description} - {location.line_1}{" "}
                      {location.line_2} {location.city}
                    </MenuItem>
                  )
                )
              ) : (
                <MenuItem disabled value={null}>
                  Organization Location not found
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {organizationLocationListMetaData.isLoading && (
            <CircularProgress size={20} />
          )}
        </SelectBoxDiv>

        <SelectBoxDiv>
          <FormControl fullWidth>
            <InputLabel>Product</InputLabel>
            <Select
              label="Product"
              fullWidth
              value={selectOption.product_id}
              onChange={handleSelectProduct}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    overflowY: "auto",
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {productListMetaData?.data?.length > 0 ? (
                (productListMetaData.data || []).map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.title}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value={null}>
                  Product not found
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {productListMetaData.isLoading && <CircularProgress size={20} />}
        </SelectBoxDiv>

        <SelectBoxDiv>
          <FormControl fullWidth>
            <InputLabel>Product batch</InputLabel>
            <Select
              label="Product batch"
              fullWidth
              value={selectOption.product_batch_id}
              onChange={handleSelectProductBatch}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 300,
                    overflowY: "auto",
                  },
                },
                anchorOrigin: {
                  vertical: "bottom",
                  horizontal: "left",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
                getContentAnchorEl: null,
              }}
            >
              {productBatchListMetaData?.data?.length > 0 ? (
                (productBatchListMetaData.data || []).map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.external_id}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled value={null}>
                  Prodcut batch not found
                </MenuItem>
              )}
            </Select>
          </FormControl>
          {productBatchListMetaData.isLoading && <CircularProgress size={20} />}
        </SelectBoxDiv>
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
  resetMetaDataState,
  getDashboardOverviewData,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UpdateDocumentEffectiveDateDialog);
