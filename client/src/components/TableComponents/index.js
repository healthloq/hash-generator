import * as React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
  Paper,
  Toolbar,
  CircularProgress,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { makeStyles } from "@mui/styles";
import SyncedFilesFilter from "./SyncedFilesFilter";
import VerificationDocumentsOverviewFilter from "./VerificationDocumentsOverviewFilter";

const useStyle = makeStyles((theme) => ({
  tableHeadCell: {
    fontWeight: theme.typography.fontWeightBold,
  },
  tableHeadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      justifyContent: "center",
      "&>div:first-child": {
        margin: "20px 0",
      },
    },
  },
  tableCell: {
    lineBreak: "anywhere",
  },
}));

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

function EnhancedTableHead(props) {
  const { order, orderBy, onRequestSort, headCells } = props;
  const classes = useStyle();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            padding={"normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            className={classes.tableHeadCell}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
              disabled={headCell.id === "action"}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

function EnhancedTableToolbar(props) {
  const { tableTitle, tableId } = props;
  const classes = useStyle();
  const getFilterComponent = () => {
    if (tableId === "syncedFilesFilter") return <SyncedFilesFilter />;
    else if (tableId === "documentVerificationOverviewFilter")
      return <VerificationDocumentsOverviewFilter />;
  };

  return (
    <React.Fragment>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
        }}
      >
        <Box className={classes.tableHeadingContainer}>
          <Typography variant="h4" component="div">
            {tableTitle}
          </Typography>
          {getFilterComponent()}
        </Box>
      </Toolbar>
    </React.Fragment>
  );
}

export default function EnhancedTable({
  tableTitle = "",
  headCells = [],
  isLoading = false,
  rows = [],
  tableId = "",
}) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const classes = useStyle();
  const headerKeys = headCells?.map((headerObj) => headerObj?.id);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar tableTitle={tableTitle} tableId={tableId} />
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={"medium"}
          >
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              headCells={headCells}
            />
            <TableBody>
              {isLoading && (
                <TableRow
                  style={{
                    height: 53,
                  }}
                >
                  <TableCell colSpan={headCells.length}>
                    <Box
                      display={"flex"}
                      alignItems="center"
                      justifyContent={"center"}
                    >
                      Loading...
                      <CircularProgress size={20} sx={{ ml: 1 }} />
                    </Box>
                  </TableCell>
                </TableRow>
              )}
              {/* if you don't need to support IE11, you can replace the `stableSort` call with:
                 rows.sort(getComparator(order, orderBy)).slice() */}
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  return (
                    <TableRow hover tabIndex={-1} key={index}>
                      {Object.entries(row)
                        ?.filter(([key, value]) => headerKeys?.includes(key))
                        .map(([key, value], cellIndex) => {
                          const headCell = headCells?.filter(
                            (item) => item?.id === key
                          )[0];
                          return (
                            <TableCell
                              align={headCell?.numeric ? "right" : "left"}
                              key={cellIndex}
                              className={classes.tableCell}
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                    </TableRow>
                  );
                })}
              {rows?.length === 0 && (
                <TableRow
                  style={{
                    height: 53,
                  }}
                >
                  <TableCell
                    colSpan={headCells.length}
                    sx={{ textAlign: "center" }}
                  >
                    Data not available.
                  </TableCell>
                </TableRow>
              )}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <TableCell colSpan={headCells.length} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50, 100, 500]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
