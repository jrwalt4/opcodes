import * as React from "react";
import AppBar from "@material-ui/core/AppBar";
import MuiContainer from "@material-ui/core/Container";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";

import Board from "components/Board";

const AppContainer = withStyles((theme) => ({
  root: {
    padding: theme.spacing(2)
  }
}))(MuiContainer);

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6">Gates Playground</Typography>
        </Toolbar>
      </AppBar>
      <AppContainer>
        <Board />
      </AppContainer>
    </>
  );
}
