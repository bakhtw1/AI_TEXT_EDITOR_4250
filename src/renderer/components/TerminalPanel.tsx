import React, {createRef, RefObject} from "react";
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';
import { ipcRenderer } from "electron";
import 'xterm/css/xterm.css';

export default class TerminalComponent extends React.Component {
    terminalRef: RefObject<HTMLDivElement>;
    terminal!: Terminal;
    
    constructor(props: any) {
        super(props);
        this.terminalRef = createRef();

        const fitAddon = new FitAddon();
        
        this.terminal = new Terminal({
            cursorBlink: true, 
            rendererType: 'canvas',
            screenReaderMode: true, 
            convertEol: true,
            cols: 80, 
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
        if (this.terminalRef.current) {
            this.terminal.open(this.terminalRef.current);
        }
    }

    componentWillUnmount() {
        this.terminal.dispose();
    }
    
    render() {
        return (
            <div style={{backgroundColor: 'black',}} id="terminal" ref={this.terminalRef} />
        );
    }
}



