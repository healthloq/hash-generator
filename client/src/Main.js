import React, { Suspense, lazy } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SuspenseLoader } from "./components/common";
import Socket from "./components/socket/Socket";
import DocumentVerification from "./containers/DocumentVerification";
const Home = lazy(() => import("./containers/Home"));

export const Main = (props) => {
  const routes = [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/document-verification",
      element: <DocumentVerification />,
    },
  ];
  return (
    <Suspense fallback={<SuspenseLoader />}>
      <Socket />
      <BrowserRouter>
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

const mapStateToProps = (state) => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Main);
