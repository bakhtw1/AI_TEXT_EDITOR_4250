import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as mon from 'monaco-editor';

export const KEY_PHRASE = '@ai-help:';
const SERVER_HOST = "http://127.0.0.1:5000";

interface IAssistantManager {
    handleEditorValueChange: (editor: mon.editor.IStandaloneCodeEditor, value: string) => void,
    execute: (editor: mon.editor.IStandaloneCodeEditor) => void,
    available: boolean,
    getAssists: () => Promise<string[]>,
}

const AssistantManagerContext = createContext<IAssistantManager | null>(null);

interface QueryData {
    prompt: string;
}

interface AssistantManagerProviderProps {
    children: React.ReactNode
}

export function AssistantManagerProvider(props: AssistantManagerProviderProps) {
    // TODO: set this to server health
    const [available, setAvailable] = useState(false);

    useEffect(() => {
        function waitForAvailable() {
            setTimeout(async () => {
                const running = await getHealth();
    
                if (running) {
                    setAvailable(true);
                } else {
                    waitForAvailable();
                }
            }, 5000);
        }

        waitForAvailable();
    }, []);

    async function sendRequest(data: string): Promise<string> {
        let dataBody: QueryData = {
            prompt : data
        };

        const httpRequest = axios.create({
            baseURL: SERVER_HOST,
            headers: {"Content-type": "application/json"}
        });

        const res = await httpRequest.post("/predict", dataBody);
        
        return res.data as string;
    }

    async function getAssists(): Promise<string[]> {
        const httpRequest = axios.create({
            baseURL: SERVER_HOST,
            headers: {"Content-type": "application/json"}
        });

        const res = await httpRequest.get('/prompts');

        return res.data as string[];
    }

    async function getHealth(): Promise<boolean> {
        const httpRequest = axios.create({
            baseURL: SERVER_HOST,
            headers: {"Content-type": "application/json"}
        });
        
        try {
            await httpRequest.get('/health');

            return true;
        } catch {
            return false;
        }
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
            editor.trigger(null, 'editor.action.triggerSuggest', {});
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
        available,
        getAssists,
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
