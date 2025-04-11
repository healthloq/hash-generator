import { Grid, IconButton, Tooltip } from "@mui/material";
import { verifiedDocumentsHeaders } from "../../constants/tableConfigs";
import {
  fetchFolderPath,
  fetchVerifyDocumentCount,
  getFolderOverview,
  handleDocumentVerification,
  setApiFlagsInitialState,
  setInitialState,
} from "../../redux/actions";
import EnhancedTable from "../TableComponents";
import moment from "moment";
import { DocumentVerificationDetailOverview } from "../common/DocumentVerificationDetailOverview";
import { useEffect, useState } from "react";
import { connect } from "react-redux";
import VisibilityIcon from "@mui/icons-material/Visibility";

const DocumentTableView = ({
  folderOverview,
  getVerifyDocumentCount,
  filterValue,
}) => {
  const [
    documentDetailOverviewDialogData,
    setDocumentDetailOverviewDialogData,
  ] = useState(null);
  const [tableRows, setTableRows] = useState(
    getVerifyDocumentCount?.doc || folderOverview?.doc
  );

  const handleFilter = () => {
    let tempArray = getVerifyDocumentCount?.doc || folderOverview?.doc;

    // Document verification filter
    if (filterValue.verificationType) {
      if (filterValue.verificationType === "verifiedDocWithVerifiedOrg") {
        tempArray = tempArray.filter(
          (row) =>
            row["Is Verified Document"] === "Yes" &&
            row["Is Verified Organization"] === "Yes"
        );
      }

      if (filterValue.verificationType === "verifiedDocWithUnverifiedOrg") {
        tempArray = tempArray.filter(
          (row) =>
            row["Is Verified Document"] === "Yes" &&
            row["Is Verified Organization"] === "No"
        );
      }

      if (filterValue.verificationType === "unverifiedDoc") {
        tempArray = tempArray.filter(
          (row) => row["Is Verified Document"] === "No"
        );
      }

      if (filterValue.verificationType === "all") {
        tempArray = tempArray;
      }
    }

    // Organization filter
    if (filterValue.producer) {
      tempArray = tempArray.filter(
        (row) => row["Organization Name"] === filterValue.producer
      );
    }

    // Date filter
    if (filterValue.date) {
      tempArray = tempArray.filter((row) => {
        const createdAtDate = moment(row.Created);
        return (
          createdAtDate.date() === filterValue.date.date() &&
          createdAtDate.month() === filterValue.date.month() &&
          createdAtDate.year() === filterValue.date.year()
        );
      });
    }

    setTableRows(tempArray);
  };

  useEffect(() => {
    handleFilter();
  }, [filterValue, getVerifyDocumentCount?.doc, folderOverview?.doc]);

  return (
    <Grid sx={{ marginTop: "30px" }}>
      <EnhancedTable
        tableTitle="Document Verification Overview"
        headCells={verifiedDocumentsHeaders}
        rows={tableRows?.map((item) => {
          const data = {
            organization_name: item["Organization Name"]
              ? item["Organization Name"]
              : "-",
            is_verified_organization: item["Is Verified Organization"]
              ? item["Is Verified Organization"]
              : "No",
            file_name: item["File Name"],
            file_path: item["File Path"],
            is_verified_document: item["Is Verified Document"],
            created: item["Created"]
              ? moment(item["Created"]).format("MM/DD/YYYY hh:mm A")
              : "",
            message: item["Message"],
            error_message: item["Error Message"],
          };
          return {
            ...data,
            action: (
              <Tooltip arrow title="View More">
                <IconButton
                  color={data.is_verified_document === "Yes" ? "primary" : "error"}
                  onClick={() =>
                    setDocumentDetailOverviewDialogData({
                      ...item,
                      Created: item["Created"]
                        ? moment(item["Created"]).format("MM/DD/YYYY hh:mm A")
                        : "",
                    })
                  }
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            ),
          };
        })}
        tableId="documentVerificationOverviewFilter"
        isLoading={false}
      />

      <DocumentVerificationDetailOverview
        open={Boolean(documentDetailOverviewDialogData)}
        handleClose={() => setDocumentDetailOverviewDialogData(null)}
        data={documentDetailOverviewDialogData || {}}
      />
    </Grid>
  );
};

const mapStateToProps = ({
  reducer: {
    organizationList,
    folderOverview,
    documentVerificationData,
    apiFlags,
    getFolderPathList,
    getVerifyDocumentCount,
    filterValue,
  },
}) => ({
  documentVerificationData,
  organizationList,
  folderOverview,
  apiFlags,
  getFolderPathList,
  getVerifyDocumentCount,
  filterValue,
});

const mapDispatchToProps = {
  getFolderOverview,
  handleDocumentVerification,
  setInitialState,
  setApiFlagsInitialState,
  fetchFolderPath,
  fetchVerifyDocumentCount,
};

export default connect(mapStateToProps, mapDispatchToProps)(DocumentTableView);
