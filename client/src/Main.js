import React, { Suspense, lazy, useEffect } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SuspenseLoader } from "./components/common";
import PageTitle from "./components/common/PageTitle";
import DocumentVerification from "./containers/DocumentVerification";
import HealthDashboard from "./containers/HealthDashboard";
import { getSubscriptionOverview } from "./redux/actions";
const Home = lazy(() => import("./containers/Home"));

export const Main = (props) => {
  const { getSubscriptionOverview, subscriptionDetails } = props;

  useEffect(() => {
    getSubscriptionOverview();
  }, []);

  let appRoutes = [];
  if (subscriptionDetails?.subscriptionList?.length === 2) {
    appRoutes = [
      { path: "/",                       element: <Home /> },
      { path: "/document-verification",  element: <DocumentVerification /> },
    ];
  } else if (subscriptionDetails?.subscriptionList?.includes("publisher")) {
    appRoutes = [
      { path: "/", element: <Home /> },
    ];
  } else if (subscriptionDetails?.subscriptionList?.includes("verifier")) {
    appRoutes = [
      { path: "/",                      element: <Navigate to="/document-verification" /> },
      { path: "/document-verification", element: <DocumentVerification /> },
    ];
  }

  if (subscriptionDetails?.isLoading && !subscriptionDetails?.data?.length) {
    return <SuspenseLoader />;
  }

  return (
    <Suspense fallback={<SuspenseLoader />}>
      <BrowserRouter>
        <PageTitle />
        <Routes>
          {/* Subscription-dependent routes */}
          {appRoutes.map((route, key) => (
            <Route path={route.path} element={route.element} key={key} />
          ))}

          {/* Health dashboard — always available regardless of subscription */}
          <Route path="/health" element={<HealthDashboard />} />
        </Routes>
      </BrowserRouter>
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
