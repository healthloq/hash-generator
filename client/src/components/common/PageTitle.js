import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getPageTitle } from "../../utils";

export default function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    document.title = getPageTitle();
  }, [location.pathname]);
  return null;
}
