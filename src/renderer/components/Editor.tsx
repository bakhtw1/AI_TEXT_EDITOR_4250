import React, { useRef } from 'react';
import Editor, {Monaco, loader } from "@monaco-editor/react";
import path from 'path';
import * as mon from 'monaco-editor';
import { extentions } from './extensions';

interface EditorProps {
  path:string
  data:string
  filename:string
  ext:string
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
  
export default function EditorComponent(props:EditorProps) {
  
  const path_to_monaco = "node_modules/monaco-editor/min/vs";
  const editorRef = useRef<mon.editor.IStandaloneCodeEditor | null>(null);

  loader.config({
    paths: {
      vs: uriFromPath(path.join(__dirname, '../../../' ,path_to_monaco))
    }
  }); 

  function handleEditorChange(value: string, event: any) {
    console.log(value);
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: mon.editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor; 
  }

  return(
    <Editor
      height="90vh"
      theme="vs-dark"
      path={props.filename}
      defaultLanguage={extentions[props.ext]}
      defaultValue={props.data}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      onChange={handleEditorChange}
    />
  );
  
}