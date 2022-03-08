import axios from 'axios';
import React, { createContext, useContext } from 'react';
import * as mon from 'monaco-editor';

const KEY_PHRASE = '@ai-help:';

interface IAssistantManager {
    handleEditorValueChange: (editor: mon.editor.IStandaloneCodeEditor, value: string) => void,
    execute: (editor: mon.editor.IStandaloneCodeEditor) => void
}

const AssistantManagerContext = createContext<IAssistantManager | null>(null);

interface QueryData {
    prompt: string;
}

interface AssistantManagerProviderProps {
    children: React.ReactNode
}

export function AssistantManagerProvider(props: AssistantManagerProviderProps) {
    const httpRequest = axios.create({
        baseURL: "http://localhost:5000",
        headers: {"Content-type": "application/json"}
    });

    async function sendRequest(data: string): Promise<string> {
        let dataBody: QueryData = {
            prompt : data
        };

        const res = await httpRequest.post("/predict", dataBody);
        
        return res.data as string;
    }

    function handleEditorValueChange(editor: mon.editor.IStandaloneCodeEditor, value: string) {
        const contentPosition = editor.getPosition();
        const contentLines = value.split('\n');

        const line = contentLines[contentPosition!.lineNumber - 1];
        if (line.length < KEY_PHRASE.length) {
            return;
        }

        const keyPhraseBuffer = line.slice(contentPosition!.column - KEY_PHRASE.length, contentPosition!.column);

        if (keyPhraseBuffer == KEY_PHRASE) {
            console.log('Key phrase detected!');
        }
    }

    async function execute(editor: mon.editor.IStandaloneCodeEditor) {
        const content = editor.getValue();
        const position = editor.getPosition();
        const lines = content.split('\n');
        
        const line = lines[position!.lineNumber - 1];
        if (line.length < KEY_PHRASE.length) {
            return;
        }

        if (!line.startsWith(KEY_PHRASE)) {
            return;
        }

        const data = line.slice(KEY_PHRASE.length).trim();

        const result = await sendRequest(data);

        console.log(result);
    }

    const assistantManager: IAssistantManager = {
        handleEditorValueChange,
        execute,
    }

    return (
        <AssistantManagerContext.Provider
            value={assistantManager}
        >
            {props.children}
        </AssistantManagerContext.Provider>
    )
}

export function useAssistantManager() {
    return useContext(AssistantManagerContext);
}
