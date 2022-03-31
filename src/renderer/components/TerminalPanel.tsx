import React, {createRef, RefObject} from "react";
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { ipcRenderer } from "electron";
// import 'xterm/css/xterm.css';

import Box from "@mui/material/Box";

export default class TerminalComponent extends React.Component {
    terminalRef: RefObject<HTMLDivElement>;
	terminal!: Terminal;
    
    constructor(props: any) {
        super(props);
        this.terminalRef = createRef();

        const fitAddon = new FitAddon();
        
        this.terminal = new Terminal({
            cursorBlink: true, 
            rendererType: 'dom',
            screenReaderMode: true,
        });

        this.terminal.loadAddon(fitAddon); 
        this.terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
        
        this.terminal.onData((e:any) => {
            ipcRenderer.send("terminal-into", e); 
        } );
        
        ipcRenderer.on('terminal-incData', (event, data) => {
            this.terminal.write(data);
        })
        
        fitAddon.fit();
    }

    componentDidMount() {
        let element = document.getElementById('terminal');
		if (element) {
			// Creates the terminal within the container element.
			// this.terminal.open(this.terminalRef.current);
            this.terminal.open(element);
		}
	}

	componentWillUnmount() {
		// When the component unmounts dispose of the terminal and all of its listeners.
		this.terminal.dispose();
	}
    
    render() {
		return (
            // <Box sx={{width:"100%", backgroundColor: 'black'}} ref={this.terminalRef} />
            <div style={{backgroundColor: 'black',}} id="terminal" ref={this.terminalRef} />
        );
	}
}

