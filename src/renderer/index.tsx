import React from "react";
import { render } from "react-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import EditorPanel from "./components/EditorPanel";
import { FileSystemProvider, useFileSystem } from "./components/FileSystem";
import { Button, Grid } from "@mui/material";
import FileTreePanel from "./components/FileTreePanel";
import { AssistantManagerProvider } from "./components/AssistantManager";
import { Stack } from "@mui/material";
import TerminalComponent from "./components/TerminalPanel";

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

  return (
    <Grid 
      container 
      spacing={3}
    >
      {fileSystem!.explorerTree.length > 0 && (
        <Grid item xs={3}>
          <FileTreePanel />
        </Grid>
      )}
      <Grid item xs={fileSystem?.explorerTree.length == 0 ? 12 : 9}>
        <Stack spacing={3}>
          <EditorPanel />
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
