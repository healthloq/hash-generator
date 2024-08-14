import React, { useEffect, useState } from "react";
import { API } from "../redux/apis";
import {
  Button,
  Grid,
  IconButton,
  Paper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import ShowCertificateModal from "./ShowCertificateModal";
import { useSelector } from "react-redux";
import { ArrowBack } from "@mui/icons-material";
import { Link } from "react-router-dom";

const adulterants = [
  "Sildenafil",
  "Tadalafil",
  "Sibutramine",
  "Phenolphthalein",
  "Fluoxetine",
  "Steroids",
  "DMAA",
  "DMAA (1,3-dimethylamylamine)",
  "Ephedrine",
  "Ephedrine, or SARMs (Selective Androgen Receptor Modulators)",
];
const contamination = [
  "Arsenic (As)",
  "Arsenic",
  "Cadmium",
  "Cadmium (Cd)",
  "Lead",
  "Lead (Pb)",
  "Mercury (Methyl Mercury)",
  "Chromium (Chromium VI)",
  "Mercury",
  "Chromium",
  "Mercury (Hg)",
];
const microbial = [
  "Bile-Tolerant Gram-Negative Bacteria",
  "Escherichia coli",
  "Salmonella",
  "Pseudomonas Aeruginosa",
  "Staphylococcus aureus",
  "Clostridia",
  "Candida albicans",
];

const Container = styled(Grid)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const HeaderContainer = styled(Grid)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  margin-top: 50px;
`;

const StyledTableContainer = styled(TableContainer)`
  width: 90%;
  margin-top: 50px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
`;

const StyledTable = styled(Table)`
  min-width: 650px;
`;

const StyledTableHeadRow = styled(TableRow)`
  background-color: #eaf7ed;
  border-bottom: 2px solid #ddd;
`;

const StyledTableCell = styled(TableCell)`
  font-weight: bold;
  text-align: center;
`;

const DataTableCell = styled(TableCell)`
  text-align: center;
`;

const InfoContainer = styled(Grid)`
  display: flex;
  gap: 5px;
  justify-content: center;
`;

const StyledTypography = styled(Typography)`
  font-weight: bold;
`;

const StyledTableRow = styled(TableRow)`
  border-bottom: 1px solid #ddd;
`;

const ForbiddenDataPage = (props) => {
  const [forbiddenList, setForbiddenList] = useState([]);
  const [openModal, setOpenModal] = useState({
    data: null,
    open: false,
    type: null,
  });
  const [loading, setLoading] = useState(false);

  const org_id = useSelector((state) => state.reducer.subscriptionDetails);

  const handleCloseModal = () => {
    setOpenModal({
      data: null,
      open: false,
      type: null,
    });
  };
  const handleList = async () => {
    setLoading(true);
    const res = await API.forbiddenDocumnetList({
      org_id: org_id?.data[0].organization_id,
    });
    if (res?.status === 1) {
      setForbiddenList(res?.data);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleList();
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <StyledTypography variant="h2">Dashboard</StyledTypography>
        <Link to="/document-verification" underline="none">
          <Button startIcon={<ArrowBack />}>Back</Button>
        </Link>
      </HeaderContainer>
      <StyledTableContainer component={Paper}>
        <StyledTable>
          <TableHead>
            <StyledTableHeadRow>
              <StyledTableCell>Product name</StyledTableCell>
              <StyledTableCell>Manufacturer/Brand</StyledTableCell>
              <StyledTableCell>Batch Name</StyledTableCell>
              <StyledTableCell>Lab Name</StyledTableCell>
              <StyledTableCell>Authentic COA</StyledTableCell>
              <StyledTableCell>Microbial Testing</StyledTableCell>
              <StyledTableCell>Metal Testing</StyledTableCell>
              <StyledTableCell>Adulterants Testing</StyledTableCell>
              <StyledTableCell>Label Verification</StyledTableCell>
              <StyledTableCell>Date</StyledTableCell>
              <StyledTableCell>Lab Credentials</StyledTableCell>
              <StyledTableCell>Manufacturer Credentials</StyledTableCell>
            </StyledTableHeadRow>
          </TableHead>
          <TableBody>
            {loading || forbiddenList.length === 0 ? (
              <StyledTableRow style={{ height: "150px" }}>
                <DataTableCell colSpan={12}>
                  {!loading && forbiddenList.length === 0
                    ? "Please upload document"
                    : "Loading..."}
                </DataTableCell>
              </StyledTableRow>
            ) : (
              forbiddenList?.map((data, index) => (
                <StyledTableRow key={index}>
                  <DataTableCell>{data?.product_name ?? "-"}</DataTableCell>
                  <DataTableCell>
                    {data?.manufacturing_brand ?? "-"}
                  </DataTableCell>
                  <DataTableCell>{data?.batch_id ?? "-"}</DataTableCell>
                  <DataTableCell>{data?.verify_org_name ?? "-"}</DataTableCell>
                  <DataTableCell>
                    <img
                      src={
                        data?.result === "Pass" ||
                        data?.result === "Not able to read data"
                          ? "success.png"
                          : "rejected.png"
                      }
                      alt="status"
                      width="25px"
                      height="25px"
                    />
                  </DataTableCell>
                  <DataTableCell>
                    {microbial.filter((substance) =>
                      data?.result?.split(",").includes(substance)
                    ).length > 0
                      ? microbial
                          .filter((substance) =>
                            data?.result?.split(",").includes(substance)
                          )
                          .join(",")
                      : "Pass"}
                  </DataTableCell>
                  <DataTableCell>
                    {contamination.filter((substance) =>
                      data?.result?.split(",").includes(substance)
                    ).length > 0
                      ? contamination
                          .filter((substance) =>
                            data?.result?.split(",").includes(substance)
                          )
                          .join(",")
                      : "Pass"}
                  </DataTableCell>
                  <DataTableCell>
                    {adulterants.filter((substance) =>
                      data?.result?.split(",").includes(substance)
                    ).length > 0
                      ? adulterants
                          .filter((substance) =>
                            data?.result?.split(",").includes(substance)
                          )
                          .join(",")
                      : "Pass"}
                  </DataTableCell>
                  <DataTableCell>
                    {data?.lable_verification ?? "-"}
                  </DataTableCell>
                  <DataTableCell>
                    {new Date(data?.created_on).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                    }) +
                      " " +
                      ", " +
                      new Date(data?.created_on).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                  </DataTableCell>
                  <DataTableCell>
                    {data?.certificate &&
                    JSON.parse(data?.certificate)?.length > 0 &&
                    JSON.parse(data?.certificate) ? (
                      <InfoContainer>
                        <p>
                          <span>{JSON.parse(data?.certificate)?.length}</span>(
                          <span>
                            {
                              (JSON.parse(data?.certificate) ?? [])?.filter(
                                (val) =>
                                  new Date(val?.effective_date) > new Date()
                              )?.length
                            }
                          </span>
                          )
                        </p>
                        <IconButton
                          onClick={() =>
                            setOpenModal({
                              open: true,
                              data: JSON.parse(data?.certificate),
                            })
                          }
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                      </InfoContainer>
                    ) : (
                      "NA"
                    )}
                  </DataTableCell>
                  <DataTableCell>
                    {data?.manufacturing_certificate &&
                    JSON.parse(data?.manufacturing_certificate)?.length > 0 &&
                    JSON.parse(data?.manufacturing_certificate) ? (
                      <InfoContainer>
                        <p>
                          <span
                            data-toggle="tooltip"
                            data-placement="top"
                            title="Total certificate"
                          >
                            {
                              JSON.parse(data?.manufacturing_certificate)
                                ?.length
                            }
                          </span>
                          (
                          <span data-placement="top" title="Fail certificate">
                            {
                              (
                                JSON.parse(data?.manufacturing_certificate) ??
                                []
                              )?.filter(
                                (val) =>
                                  new Date(val?.effective_date) > new Date()
                              )?.length
                            }
                          </span>
                          )
                        </p>
                        <IconButton
                          onClick={() =>
                            setOpenModal({
                              open: true,
                              data: JSON.parse(data?.manufacturing_certificate),
                            })
                          }
                        >
                          <RemoveRedEyeIcon />
                        </IconButton>
                      </InfoContainer>
                    ) : (
                      "NA"
                    )}
                  </DataTableCell>
                </StyledTableRow>
              ))
            )}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
      <ShowCertificateModal
        open={openModal.open}
        handleClose={handleCloseModal}
        data={openModal.data}
        title={"Organization Certificates"}
      />
    </Container>
  );
};

export default ForbiddenDataPage;
