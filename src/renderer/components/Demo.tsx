import React, { useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import { Box, TextField } from '@mui/material';
import Editor, {Monaco, useMonaco, loader } from "@monaco-editor/react";
import path from 'path';
import * as mon from 'monaco-editor';


const someJSCodeExample = `
  // The source (has been changed) is https://github.com/facebook/react/issues/5465#issuecomment-157888325

  const CANCELATION_MESSAGE = {
    type: 'cancelation',
    msg: 'operation is manually canceled',
  };

  function makeCancelable(promise) {
    let hasCanceled_ = false;

    const wrappedPromise = new Promise((resolve, reject) => {
      promise.then(val => hasCanceled_ ? reject(CANCELATION_MESSAGE) : resolve(val));
      promise.catch(reject);
    });

    return (wrappedPromise.cancel = () => (hasCanceled_ = true), wrappedPromise);
  }

  export default makeCancelable;
`;


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={'span'}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}
function ensureFirstBackSlash(str: string) {
  return str.length > 0 && str.charAt(0) !== "/"
      ? "/" + str
      : str;
}

function uriFromPath(_path: string) {
  const pathName = path.resolve(_path).replace(/\\/g, "/");
  return encodeURI("file://" + ensureFirstBackSlash(pathName));
}

function EditorThing() {
  
  const path_to_monaco = "node_modules/monaco-editor/min/vs";
  const editorRef = useRef<mon.editor.IStandaloneCodeEditor | null>(null);
  console.log(path.resolve(path.join(__dirname, '../../../' ,path_to_monaco)));
  loader.config({
    paths: {
      vs: path.resolve(path.join(__dirname, '../../../' ,path_to_monaco))
    }
  }); 

  function handleEditorWillMount(monaco: Monaco) {
    // here is the monaco instance
    // do something before editor is mounted
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: mon.editor.IStandaloneCodeEditor, monaco: Monaco) {
    // here is the editor instance
    // you can store it in `useRef` for further usage
    editorRef.current = editor; 
  }

  return(<Editor
    height="80vh"
    theme="vs-light"
    path="script.js"
    defaultLanguage="javascript"
    defaultValue={someJSCodeExample}
    beforeMount={handleEditorWillMount}
    onMount={handleEditorDidMount}
  />);


}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Item One" {...a11yProps(0)} />
          <Tab label="Item Two" {...a11yProps(1)} />
          <Tab label="Item Three" {...a11yProps(2)} />
        </Tabs>
      </Box>
      <div style={{ display: value === 0? 'block': 'none'}}>
        <TabPanel value={value} index={0}>
          <TextField id="outlined-basic" label="Outlined" variant="outlined" />
          <EditorThing />
        </TabPanel>
      </div>
      <div style={{ display: value === 1? 'block': 'none'}}>
        <TabPanel value={value} index={1}>
          <TextField id="outlined-basic" label="Outlined" variant="outlined" />
          <EditorThing />
        </TabPanel>
      </div>
      <div style={{ display: value === 2? 'block': 'none'}}>
      <TabPanel value={value} index={2}>
        <TextField id="outlined-basic" label="Outlined" variant="outlined" />
        <EditorThing />
      </TabPanel>
      </div>
    </Box>
  );
}
