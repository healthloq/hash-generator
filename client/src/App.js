import "./App.css";
import theme from "./theme";
import { Box, ThemeProvider } from "./components";
import Home from "./containers/Home";

window.addEventListener("resize", () => {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
});

function App() {
  return (
    <Box>
      <ThemeProvider theme={theme()}>
        <Home />
      </ThemeProvider>
    </Box>
  );
}

export default App;
