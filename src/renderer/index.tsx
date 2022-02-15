import * as React from "react";
import { render } from "react-dom";
import { StyledEngineProvider } from '@mui/material/styles';
import Demo from './components/Demo';

const root = document.createElement("div");

root.id = "root";
document.body.appendChild(root);

render(
    <StyledEngineProvider injectFirst>
        <Demo />
    </StyledEngineProvider>,
    document.getElementById("root")
);