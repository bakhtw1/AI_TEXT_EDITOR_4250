import React, {createRef, RefObject} from "react";
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit';
import { ipcRenderer } from "electron";
import 'xterm/css/xterm.css';
import { iTheme, ThemeStyle, useColorScheme, useTheme } from "../config/Theme";

export const TERMINAL_HEIGHT = 320;

interface _TerminalComponentProps {
    colorScheme: ThemeStyle;
    theme: iTheme;
}

class _TerminalComponent extends React.Component<_TerminalComponentProps> {
    terminalRef: RefObject<HTMLDivElement>;
    terminal!: Terminal;

    colorScheme: ThemeStyle;
    theme: iTheme;
    
    constructor(props: _TerminalComponentProps) {
        super(props);

        this.colorScheme = props.colorScheme;
        this.theme = props.theme;

        this.terminalRef = createRef();
        
        this.terminal = new Terminal({
            cursorBlink: true, 
            rendererType: 'canvas',
            screenReaderMode: true, 
            convertEol: true,
            cols: 80, 
            theme: {
                background: this.theme.colors.editorBackground,
                foreground: this.theme.text.color,
                cursor: this.theme.text.color
            }
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
        return (
            <div 
                style={{
                    backgroundColor: this.theme.colors.editorBackground,
                    height: TERMINAL_HEIGHT
                }} 
                id="terminal" 
                ref={this.terminalRef}
            />
        );
    }
}

export default function TerminalComponent() {
    const colorScheme = useColorScheme();
    const theme = useTheme();

    return (
        <_TerminalComponent 
            colorScheme={colorScheme}
            theme={theme}
        />
    )
}

