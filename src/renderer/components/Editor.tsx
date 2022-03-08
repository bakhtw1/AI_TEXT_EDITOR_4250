import React, { useRef, KeyboardEvent } from 'react';
import Editor, {Monaco, loader } from "@monaco-editor/react";
import path from 'path';
import * as mon from 'monaco-editor';
import { extentions } from './extensions';
import { AppFile, useFileSystem } from './FileSystem';
import { useAssistantManager } from './AssistantManager';

interface EditorProps {
  file: AppFile
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
  
export default function EditorComponent(props: EditorProps) {
  const path_to_monaco = "node_modules/monaco-editor/min/vs";
  const editorRef = useRef<mon.editor.IStandaloneCodeEditor | null>(null);

  const fileSystem = useFileSystem();
  const assistantManager = useAssistantManager();

  loader.config({
    paths: {
      vs: uriFromPath(path.join(__dirname, '../../../' ,path_to_monaco))
    }
  }); 

  function handleEditorChange(value: string, event: any) {
    fileSystem?.updateFile(props.file, value);
    assistantManager?.handleEditorValueChange(editorRef.current!, value);
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: mon.editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor; 
  }

  const keyDownHandle = async (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      await props.file.save();
    }
  };

  return(
    <div onKeyDown={keyDownHandle}>
      <Editor
        height="90vh"
        theme="vs-dark"
        path={props.file.path}
        defaultLanguage={extentions[props.file.extension]}
        defaultValue={props.file.content}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
      />
    </div>
  );
}