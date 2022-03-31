import React, { useRef, KeyboardEvent, useEffect, useState } from 'react';
import Editor, {Monaco, loader } from "@monaco-editor/react";
import path from 'path';
import * as mon from 'monaco-editor';
import { extensions } from '../config/extensions';
import { AppFile, useFileSystem } from './FileSystem';
import { KEY_PHRASE, useAssistantManager } from './AssistantManager';
import { ThemeStyle, useColorScheme, useTheme } from '../config/Theme';

interface EditorProps {
  file: AppFile,
  height: number,
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

  const colorScheme = useColorScheme();
  const theme = useTheme();
  const fileSystem = useFileSystem();
  const assistantManager = useAssistantManager();

  let completionItemProvider: mon.IDisposable | null = null;

  useEffect(() => {
    return () => {
      if (completionItemProvider != null) {
        completionItemProvider.dispose();
      }
    }
  }, [completionItemProvider]);

  useEffect(() => {
    // Auto-save every 30 seconds
    const timer = setInterval(async () => {
      if (props.file.isNewFile) {
        console.log('Not auto-saving (new file)')
      } else {
        console.log('auto-save')
        await props.file.save();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  

  loader.config({
    paths: {
      vs: uriFromPath(path.join(__dirname, '../../../' ,path_to_monaco))
    }
  }); 

  const language = extensions[props.file.extension]?.toLowerCase() || '';

  function handleEditorChange(value: string, event: any) {
    fileSystem?.updateFile(props.file, value);
    assistantManager?.handleEditorValueChange(editorRef.current!, value);
  }

  function handleEditorWillMount(monaco: Monaco) {
    monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
  }

  function handleEditorDidMount(editor: mon.editor.IStandaloneCodeEditor, monaco: Monaco) {
    editorRef.current = editor; 

    completionItemProvider = monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: async function(model, position) {
        if (!assistantManager?.available) {
          return {
            suggestions: [],
          };
        }

        const range: mon.IRange = {
          startLineNumber: position.lineNumber, 
          startColumn: position.column - KEY_PHRASE.length + 1, 
          endLineNumber: position.lineNumber, 
          endColumn: position.column + 1
        };

        const buffer = model.getValueInRange(range);

        if (buffer != KEY_PHRASE) {
          return {
            suggestions: []
          };
        }

        const assists = await assistantManager.getAssists();
        const suggestions = assists.map(function (a): mon.languages.CompletionItem {
          return {
            label: KEY_PHRASE + ' ' + a,
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: KEY_PHRASE + ' ' + a,
            range: range
          };
        });

        return {
          suggestions
        }
      }
    });
  }

  const keyDownHandle = async (event: KeyboardEvent<HTMLDivElement>) => {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      await props.file.save();

      fileSystem?.updateFileTree();
    }

    if (event.shiftKey && (event.code === 'Enter' || event.code === 'NumpadEnter')) {
      editorRef.current?.updateOptions({ readOnly: true });

      console.log("Executing");
      await assistantManager?.execute(editorRef.current!);
      
      editorRef.current?.updateOptions({ readOnly: false });
    }
  };

  return(
    <div onKeyDown={keyDownHandle}>
      <Editor
        height={props.height}
        theme={colorScheme == ThemeStyle.dark ? "vs-dark" : 'light'}
        path={props.file.path}
        defaultLanguage={language}
        defaultValue={props.file.content}
        beforeMount={handleEditorWillMount}
        onMount={handleEditorDidMount}
        onChange={handleEditorChange}
      />
    </div>
  );
}