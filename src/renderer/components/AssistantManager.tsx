import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as mon from 'monaco-editor';

export const KEY_PHRASE = '@ai-help';
const SERVER_HOST = "http://127.0.0.1:5001";

function cacheBuster(url: string): string {
    return `${url}?cb=${Date.now()}`;
}

interface IAssistantManager {
    handleEditorValueChange: (editor: mon.editor.IStandaloneCodeEditor, value: string) => void,
    execute: (editor: mon.editor.IStandaloneCodeEditor) => void,
    available: boolean,
    getAssists: () => Promise<string[]>,
    setOAIParams: (token : string) => void,
}

enum AIQueryType {
    documentation,
    fullCompletion,
    quickCompletion
}

const AssistantManagerContext = createContext<IAssistantManager | null>(null);

interface QueryData {
    prompt: string;
}

interface AssistantManagerProviderProps {
    children: React.ReactNode
}

export function AssistantManagerProvider(props: AssistantManagerProviderProps) {
    const [available, setAvailable] = useState(false);
    const [oaiToken, setOaiToken] = useState('');

    useEffect(() => {
        function waitForAvailable() {
            setTimeout(async () => {
                const running = await getHealth();
    
                if (running) {
                    setAvailable(true);
                    console.log('AI server ready!')
                } else {
                    waitForAvailable();
                }
            }, 5000);
        }

        waitForAvailable();
    }, []);

    const httpRequest = axios.create({
        baseURL: SERVER_HOST,
        headers: {"Content-type": "application/json"}
    });

    async function sendRequest(data: string): Promise<string> {
        let dataBody: QueryData = {
            prompt : data
        };

        const res = await httpRequest.post(cacheBuster("/predict") , dataBody);
        
        return res.data as string;
    }

    async function getAssists(): Promise<string[]> {
        const res = await httpRequest.get(cacheBuster('/prompts'));
        return res.data as string[];
    }

    async function getHealth(): Promise<boolean> {
        try {
            await httpRequest.get(cacheBuster('/health'));
            return true;
        } catch {
            return false;
        }
    }

    async function openAIRequest(data: string): Promise<string | null> {
        const dataBody = { 
            prompt : data,
            secret : oaiToken,
        };
        
        console.log(dataBody);
        const res = await httpRequest.post(cacheBuster("/oai-document") , dataBody);
        console.log(res.data);

        // let result : string[] = [];

        // for (var i = 0; i < res.data.choices.length; i++) {
        //     result.push(res.data.choices[i].text);
        // }

        // return result.join("\n");

        let choices = res.data.choices;
        if (choices.length == 0) {
            return null;
        }

        return choices[0].text;
    }

    function setOAIParams(token : string) {
        setOaiToken(token);
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
        if (!available) {
            return;
        }
        
        const content = editor.getValue();
        const position = editor.getPosition();
        const lines = content.split('\n');
        
        const line = lines[position!.lineNumber - 1];
        if (!line || line.length < KEY_PHRASE.length) {
            return;
        }

        if (!line.startsWith(KEY_PHRASE)) {
            return;
        }

        let queryType = AIQueryType.fullCompletion;

        if (line.trim().endsWith('Generate Code Documentation')) {
            queryType = AIQueryType.documentation;  
        } else if (line.trim().endsWith('Perform Code Completion')) {
            queryType = AIQueryType.fullCompletion;
        } else {
            return;
        }

        let data = "";
        let loopLine = "";
        let i = position!.lineNumber;

        do {
            loopLine = lines[i];
            data += loopLine + '\n';

            i += 1;
        } while (i < lines.length && loopLine.trim() != '');
        
        let result = "";
        data = data.trim();
        
        switch (queryType) {
            case AIQueryType.documentation:
                result = (await openAIRequest(data))!;
                break;

            case AIQueryType.fullCompletion:
                result = await sendRequest(data);
                break;
        }

        let newValue = lines.slice(0, position!.lineNumber - 1).join('\n');
        newValue += result;
        newValue += '\n' + lines.slice(i).join('\n');

        console.log(newValue);

        editor.setValue(newValue);
    }

    const assistantManager: IAssistantManager = {
        handleEditorValueChange,
        execute,
        available,
        getAssists,
        setOAIParams
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
