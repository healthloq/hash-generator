import React, { Suspense, lazy, useEffect, useState } from "react";
import { connect } from "react-redux";
import { Box, Tabs, Tab } from "@mui/material";
import { SuspenseLoader } from "./components/common";
import DocumentVerification from "./containers/DocumentVerification";
import HealthDashboard from "./containers/HealthDashboard";
import { getSubscriptionOverview } from "./redux/actions";
const Home = lazy(() => import("./containers/Home"));

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
      <Box sx={{ bgcolor: "grey.50", minHeight: "100vh" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "white", boxShadow: 1 }}>
          <Tabs
            value={safeTab}
            onChange={(_, v) => setActiveTab(v)}
            indicatorColor="primary"
            textColor="primary"
            sx={{ px: 2 }}
          >
            {tabs.map((t, i) => (
              <Tab key={i} label={t.label} />
            ))}
          </Tabs>
        </Box>
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
