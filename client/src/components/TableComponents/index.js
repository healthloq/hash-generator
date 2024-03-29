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
  Checkbox,
  lighten,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { makeStyles } from "@mui/styles";
import SyncedFilesFilter from "./SyncedFilesFilter";
import VerificationDocumentsOverviewFilter from "./VerificationDocumentsOverviewFilter";

const useStyle = makeStyles((theme) => ({
  tableHeadCell: {
    fontWeight: theme.typography.fontWeightBold,
  },
  toolbarRoot: {
    backgroundColor: "#FBFBFB",
  },
  toolbarActive: {
    color: "#008F2B",
    backgroundColor: lighten("#008F2B", 0.85),
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
  checkboxColor: {
    color: "#008F2B !important",
  },
  rowSelected: {
    backgroundColor: `${lighten("#008F2B", 0.85)} !important`,
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
  const {
    order,
    orderBy,
    onRequestSort,
    headCells,
    showCheckbox = false,
    numSelected = 0,
    rowCount = 0,
    onSelectAllClick = () => {},
  } = props;
  const classes = useStyle();
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {showCheckbox && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all desserts" }}
              classes={{ colorSecondary: classes.checkboxColor }}
            />
          </TableCell>
        )}
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
  const { tableTitle, tableId, numSelected, getBulkActionInfo = null } = props;
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
        className={`${classes.toolbarRoot} ${
          numSelected > 0 ? classes.toolbarActive : ""
        }`}
      >
        <Box className={classes.tableHeadingContainer}>
          {numSelected > 0 ? (
            <Typography
              className={classes.title}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {numSelected} selected
            </Typography>
          ) : (
            <Typography variant="h4" component="div">
              {tableTitle}
            </Typography>
          )}
          {numSelected > 0 ? (
            <Box className={classes.bulkActionRoot}>{getBulkActionInfo}</Box>
          ) : (
            getFilterComponent()
          )}
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
  showCheckbox = false,
  setSelected = () => [],
  selected = [],
  getBulkActionInfo = null,
}) {
  const [order, setOrder] = React.useState("asc");
  const [orderBy, setOrderBy] = React.useState("calories");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const classes = useStyle();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", mb: 2 }}>
        <EnhancedTableToolbar
          tableTitle={tableTitle}
          tableId={tableId}
          numSelected={selected.length}
          getBulkActionInfo={getBulkActionInfo}
        />
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
              showCheckbox={showCheckbox}
              numSelected={selected.length}
              rowCount={rows.length}
              onSelectAllClick={handleSelectAllClick}
            />
            <TableBody>
              {isLoading && (
                <TableRow
                  style={{
                    height: 53,
                  }}
                >
                  <TableCell
                    colSpan={headCells.length + (showCheckbox ? 1 : 0)}
                  >
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
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      key={index}
                      selected={isItemSelected}
                      classes={{ selected: classes.rowSelected }}
                    >
                      {showCheckbox && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event) => handleClick(event, row.id)}
                            inputProps={{ "aria-labelledby": labelId }}
                            classes={{ colorSecondary: classes.checkboxColor }}
                          />
                        </TableCell>
                      )}
                      {headCells?.map((column, key) => {
                        return (
                          <TableCell
                            className={classes.tableCell}
                            key={key}
                            align={
                              column?.id === "action"
                                ? "center"
                                : column?.numeric
                                ? "right"
                                : "left"
                            }
                          >
                            {row[column?.id]}
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
