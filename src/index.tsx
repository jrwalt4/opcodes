import * as React from "react";
import { render } from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import { ThemeProvider, createMuiTheme } from "@material-ui/core/styles";

import App from "components/App";

const rootTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#4298b5"
    },
    secondary: {
      main: "#c8102e"
    }
  }
});

const Root = () => (
  <ThemeProvider theme={rootTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);

const rootElement = document.getElementById("root");
render(<Root />, rootElement);
