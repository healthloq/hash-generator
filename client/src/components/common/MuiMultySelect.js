import React from "react";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import ListItemText from "@material-ui/core/ListItemText";
import Select from "@material-ui/core/Select";
import Checkbox from "@material-ui/core/Checkbox";
import { styled } from "@mui/material";

const PrimaryFormControl = styled(FormControl)(({ theme }) => ({
  margin: theme.spacing(1),
  minWidth: 120,
  maxWidth: 300
}))
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function MultipleSelect({
  values = [],
  handleChange = () => { },
  menuItems = [],
}) {

  return (
    <PrimaryFormControl>
      <Select
        multiple
        value={values}
        onChange={handleChange}
        input={<Input />}
        renderValue={(selected) => selected.join(", ")}
        MenuProps={MenuProps}
      >
        {menuItems.map((item, key) => (
          <MenuItem key={key} value={item?.value}>
            <Checkbox checked={values.indexOf(item?.value) > -1} />
            <ListItemText primary={item?.label} />
          </MenuItem>
        ))}
      </Select>
    </PrimaryFormControl>
  );
}
