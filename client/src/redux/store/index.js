import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import allReducers from "../reducers/rootReducer";
import { composeWithDevTools } from "redux-devtools-extension";

const middleware = [thunk];

const store = () => {
  return createStore(
    allReducers,
    composeWithDevTools(applyMiddleware(...middleware))
  );
};

export default store();
