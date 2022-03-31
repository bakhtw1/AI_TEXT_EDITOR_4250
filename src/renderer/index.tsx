import React, { useEffect, useState } from "react";
import { render } from "react-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import EditorPanel from "./components/EditorPanel";
import { FileSystemProvider, useFileSystem } from "./components/FileSystem";
import { Button, Grid } from "@mui/material";
import FileTreePanel from "./components/FileTreePanel";
import { AssistantManagerProvider } from "./components/AssistantManager";
import { Stack } from "@mui/material";
import TerminalComponent, { TERMINAL_HEIGHT } from "./components/TerminalPanel";
import { useTheme } from "./config/Theme";

import './styles/normalize.css';
import './styles/custom.css';

const root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <FileSystemProvider>
        <AssistantManagerProvider>
          <Main />
        </AssistantManagerProvider>
      </FileSystemProvider>
    </StyledEngineProvider>
  );
}

function Main() {
  const fileSystem = useFileSystem();
  const theme = useTheme();

  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    function onResize(event: UIEvent) {
      setWindowHeight(window.innerHeight);
    }

    window.addEventListener('resize', onResize);

    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <Grid 
      container 
      // spacing={3}
      bgcolor={theme.colors.toolbarBackground}
    >
      {fileSystem!.explorerTree.length > 0 && (
        <Grid item xs={3}>
          <FileTreePanel 
            height={windowHeight}
          />
        </Grid>
      )}
      <Grid item xs={fileSystem?.explorerTree.length == 0 ? 12 : 9}>
        <Stack spacing={3}>
          <EditorPanel 
            height={windowHeight - TERMINAL_HEIGHT - 24}
          />
          <TerminalComponent />
        </Stack>
      </Grid>
    </Grid>
  )
}

render(
    <App/>,
    document.getElementById("root")
);
