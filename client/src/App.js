import "./App.css";
import theme from "./theme";
import { Box, ThemeProvider } from "@mui/material";
import Main from "./Main";
import { Provider } from "react-redux";
import store from "./redux/store";
import Socket from "./components/socket/Socket";

window.addEventListener("resize", () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme()}>
        <Box>
          <Socket />
          <Main />
        </Box>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
