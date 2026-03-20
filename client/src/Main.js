import React, { Suspense, lazy, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Box, Tab, Tabs } from "@mui/material";
import { SuspenseLoader } from "./components/common";
import DocumentVerification from "./containers/DocumentVerification";
import HealthDashboard from "./containers/HealthDashboard";
import { getSubscriptionOverview } from "./redux/actions";
const Home = lazy(() => import("./containers/Home"));

// Shared sx applied to every Tab — active state handled via &.Mui-selected
const folderTabSx = {
  borderRadius: "8px 8px 0 0",
  border: "2px solid rgba(0,0,0,0.15)",
  borderBottom: "3px solid #28A745",   // matches container line for inactive tabs
  bgcolor: "rgba(232,245,233,0.7)",     // muted light-green for inactive
  mb: "-3px",                           // overlap the 3px bottom border
  mt: "6px",                            // inactive tabs sit slightly lower
  minHeight: 38,
  px: 2.5,
  textTransform: "none",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "text.secondary",
  transition: "margin-top 0.15s, background-color 0.15s",
  "&.Mui-selected": {
    bgcolor: "white",
    border: "2px solid #28A745",
    borderBottom: "3px solid white",    // breaks the green line → "on top" effect
    color: "#28A745",
    fontWeight: 700,
    mt: 0,                              // active tab rises to the top
    position: "relative",
    zIndex: 1,
  },
  "&:hover:not(.Mui-selected)": {
    bgcolor: "rgba(232,245,233,0.95)",
  },
};

export const Main = ({ getSubscriptionOverview, subscriptionDetails }) => {
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    getSubscriptionOverview();
  }, []);

  if (subscriptionDetails?.isLoading && !subscriptionDetails?.data?.length) {
    return <SuspenseLoader />;
  }

  const subs = subscriptionDetails?.subscriptionList ?? [];
  const hasPublisher = subs.includes("publisher");
  const hasVerifier = subs.includes("verifier");

  const tabs = [];
  if (hasPublisher) tabs.push({ label: "Document Protection", component: <Home /> });
  if (hasVerifier) tabs.push({ label: "Document Verification", component: <DocumentVerification /> });
  tabs.push({ label: "Health Status", component: <HealthDashboard /> });

  const safeTab = Math.min(activeTab, tabs.length - 1);

  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
        {/* Folder-tab strip */}
        <Box sx={{ bgcolor: "#e8f5e9", px: 2, pt: 1, borderBottom: "3px solid #28A745" }}>
          <Tabs
            value={safeTab}
            onChange={(_, v) => setActiveTab(v)}
            TabIndicatorProps={{ style: { display: "none" } }}
            sx={{
              minHeight: "unset",
              "& .MuiTabs-flexContainer": { gap: "6px", alignItems: "flex-end" },
            }}
          >
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} sx={folderTabSx} />
            ))}
          </Tabs>
        </Box>

        {/* Tab content */}
        {tabs.map((t, i) =>
          safeTab === i ? <Box key={i}>{t.component}</Box> : null
        )}
      </Box>
    </Suspense>
  );
};

const mapStateToProps = ({ reducer: { subscriptionDetails } }) => ({
  subscriptionDetails,
});

const mapDispatchToProps = {
  getSubscriptionOverview,
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
