import React, {createRef, RefObject} from "react";
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';
import { ipcRenderer } from "electron";
import 'xterm/css/xterm.css';
import { iTheme, useTheme } from "../config/Theme";

export const TERMINAL_HEIGHT = 320;

interface _TerminalComponentProps {
    theme: iTheme;
}

class _TerminalComponent extends React.Component<_TerminalComponentProps> {
    terminalRef: RefObject<HTMLDivElement>;
    terminal!: Terminal;
    
    constructor(props: _TerminalComponentProps) {
        super(props);

        this.terminalRef = createRef();

        console.log('create terminal');
        
        this.terminal = new Terminal({
            cursorBlink: true, 
            rendererType: 'canvas',
            screenReaderMode: true, 
            convertEol: true,
            cols: 80,
        });

        this.terminal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ');
        
        this.terminal.onData((e:any) => {
            ipcRenderer.send("terminal-into", e); 
        } );
        
        ipcRenderer.on('terminal-incData', (event, data) => {
            this.terminal.write(data);
        })
    }

    componentDidMount() {
        console.log('mount');
        if (this.terminalRef.current) {
            const fitAddon = new FitAddon();
            this.terminal.loadAddon(fitAddon); 
            this.terminal.open(this.terminalRef.current);
            fitAddon.fit();
        }
    }

    componentWillUnmount() {
        this.terminal.dispose();
    }
    
    render() {
        this.terminal.options.theme = {
            background: this.props.theme.colors.editorBackground,
            foreground: this.props.theme.text.color,
            cursor: this.props.theme.text.color
        };

        // console.log(this.terminal.options.theme);
        
        return (
            <div 
                style={{
                    backgroundColor: this.props.theme.colors.editorBackground,
                    height: TERMINAL_HEIGHT
                }} 
                id="terminal" 
                ref={this.terminalRef}
            />
        );
    }
}

export default function TerminalComponent() {
    const theme = useTheme();

    return (
        <_TerminalComponent 
            theme={theme}
        />
    )
}

