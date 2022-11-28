import * as Dom from "react-router-dom";
import * as Mui from "@mui/material";
export * from "@mui/material";
export { makeStyles } from "@mui/styles";

export const Link = ({ children, to = "", underline = "hover", ...props }) => {
  return (
    <Mui.Link {...props} underline={underline} component={Dom.Link} to={to}>
      {children}
    </Mui.Link>
  );
};
