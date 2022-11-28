import DashboardReducer from "./dashboard";

const allReducers = (state = {}, action) => {
  return {
    DashboardReducer: DashboardReducer(state.DashboardReducer, action, state),
  };
};

export default allReducers;
