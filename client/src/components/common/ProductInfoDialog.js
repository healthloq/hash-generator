import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React from "react";

const productInfoLables = {
  IntegrantId: "Integrant Id",
  Title: "Title",
  Description: "Description",
  BuyAgainUrl: "Buy Again Url",
  ExternalId: "External Id",
  ExternalIdSlug: "External Id Slug",
  Facets: "Facets",
  OtherFacets: "Other Facets",
  QrUrl: "Qr Url",
  IntegrantTypeId: "Integrant Type Id",
  IntegrantTypeTitle: "Integrant Type Title",
  IntegrantTypeDirections: "Member Type Directions",
  IntegrantTypeWarnings: "Integrant Type Warnings",
  IntegrantTypeImageUrl: "Member Type Image Url",
  IntegrantTypeCurrentIntegrantId: "Integrant Type Current Integrant Id",
  IntegrantTypeExternalId: "Member Type External Id",
  OrganizationId: "Organization Id",
  OrganizationName: "Organization Name",
  LocationId: "Location Id",
  LocationLine1: "Location Line1",
  LocationLine2: "Location Line2",
  LocationCity: "Location City",
  LocationState: "Location State",
  LocationZip: "Location Zip",
  LocationCoordinates: "Location Coordinates",
  LocationCountry: "Location Country",
  CreatedBy: "Created By",
  UpdatedBy: "Updated By",
  IsPublished: "Is Published",
  CreatedOn: "Created On",
  UpdatedOn: "Updated On",
};

let orgExhibitInfoLabels = {
  id: "Document Id",
  title: "Title",
  description: "Description",
  effective_date: "Effective Date",
  organization_id: "Organization Id",
  organization_name: "Organization Name",
  created_on: "Created On",
};

let documentHashLabels = {
  id: "Document Id",
  documentHashId: "Document Hash Id",
  organization_id: "Organization Id",
  organization_name: "Organization Name",
  created_on: "Created On",
  updated_on: "Updated On",
};

const useStyle = makeStyles((theme) => ({
  healthloqWidgetTableRow: {
    "&>td": {
      border: `1px solid ${theme.palette.borderColor}`,
    },
    "&:nth-child(even)": {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

export default function ProductInfoDialog({
  open = false,
  handleClose = () => {},
  data,
}) {
  const classes = useStyle();
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {data?.type === "organization_exhibit" || data?.type === "document_hash"
          ? "Document "
          : "Product "}
        Info
      </DialogTitle>
      <DialogContent>
        <Table>
          <TableBody>
            {Object.entries(
              data?.type === "organization_exhibit"
                ? orgExhibitInfoLabels
                : data?.type === "document_hash"
                ? documentHashLabels
                : productInfoLables
            ).map((item, key) => {
              return (
                <TableRow key={key} className={classes.healthloqWidgetTableRow}>
                  <TableCell>{item[1]}</TableCell>
                  <TableCell>{data[item[0]]}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          color="lightBlackColor"
          onClick={handleClose}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
