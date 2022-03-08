import axios from 'axios';
import React, { createContext, useContext } from 'react';
import * as mon from 'monaco-editor';

interface IAssistantManager {
    handleEditorValueChange: (editor: mon.editor.IStandaloneCodeEditor, value: string) => void,
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
        const keyPhrase = '@ai-help:';

        if (value.length < keyPhrase.length) {
            return;
        }

        const contentPosition = editor.getPosition();
        const contentLines = value.split('\n');

        const keyPhraseBuffer = contentLines[contentPosition!.lineNumber - 1].slice(contentPosition!.column - keyPhrase.length, contentPosition!.column);

        if (keyPhraseBuffer == keyPhrase) {
            console.log('Key phrase detected!');
        }
    }

    const assistantManager: IAssistantManager = {
        handleEditorValueChange,
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