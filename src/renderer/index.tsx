import React from "react";
import { render } from "react-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import EditorPanel from "./components/EditorPanel";
import CustomMenu from "./components/Menu";
import { FileSystemProvider } from "./components/FileSystem";

const root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <FileSystemProvider>
        <CustomMenu />
        <EditorPanel />
      </FileSystemProvider>
    </StyledEngineProvider>
  );
}

render(
    <App/>,
    document.getElementById("root")
);
