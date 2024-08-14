import React, { Suspense, lazy, useEffect } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SuspenseLoader } from "./components/common";
import PageTitle from "./components/common/PageTitle";
// import Socket from "./components/socket/Socket";
import DocumentVerification from "./containers/DocumentVerification";
import { getSubscriptionOverview } from "./redux/actions";
import ForbiddenDataPage from "./containers/ForbiddenDataPage";
const Home = lazy(() => import("./containers/Home"));

export const Main = (props) => {
  const { getSubscriptionOverview, subscriptionDetails } = props;

  useEffect(() => {
    getSubscriptionOverview();
  }, []);
  let routes = [];
  if (subscriptionDetails?.subscriptionList?.length === 2) {
    routes = [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/document-verification",
        element: <DocumentVerification />,
      },
      {
        path: "/forbidden-data-list",
        element: <ForbiddenDataPage />,
      },
    ];
  } else if (subscriptionDetails?.subscriptionList?.includes("publisher")) {
    routes = [
      {
        path: "/",
        element: <Home />,
      },
    ];
  } else if (subscriptionDetails?.subscriptionList?.includes("verifier")) {
    routes = [
      {
        path: "/",
        element: <Navigate to={"/document-verification"} />,
      },
      {
        path: "/document-verification",
        element: <DocumentVerification />,
      },
    ];
  }
  if (subscriptionDetails?.isLoading && !subscriptionDetails?.data?.length) {
    return <SuspenseLoader />;
  }
  return (
    <Suspense fallback={<SuspenseLoader />}>
      {/* <Socket /> */}
      <BrowserRouter>
        <PageTitle />
        <Routes>
          {routes?.map((route, key) => {
            return (
              <Route path={route.path} element={route.element} key={key} />
            );
          })}
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
