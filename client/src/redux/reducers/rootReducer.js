import Reducer from "./";

const allReducers = (state = {}, action) => {
  return {
    reducer: Reducer(state.reducer, action, state),
  };
};

export default allReducers;
