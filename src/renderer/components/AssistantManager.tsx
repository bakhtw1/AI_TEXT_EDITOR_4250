import axios from 'axios';
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as mon from 'monaco-editor';

export const KEY_PHRASE = '@ai-help';
const SERVER_HOST = "http://127.0.0.1:5001";

function cacheBuster(url: string): string {
    return `${url}?cb=${Date.now()}`;
}

interface IAssistantManager {
    handleEditorValueChange: (editor: mon.editor.IStandaloneCodeEditor, value: string, mark: any) => void,
    execute: (editor: mon.editor.IStandaloneCodeEditor) => void,
    getAssists: () => Promise<string[]>,
    setOAIParams: (token : string) => void,
    getSuggestions: (data: string) => Promise<string[]>,
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
    const [oaiToken, setOaiToken] = useState('');
    let quickPredictTimeout: NodeJS.Timeout | null = null;

    const httpRequest = axios.create({
        baseURL: SERVER_HOST,
        headers: {"Content-type": "application/json"}
    });

    async function sendRequest(data: string): Promise<string | null> {
        let dataBody: QueryData = {
            prompt : data
        };

        const res = await httpRequest.post(cacheBuster("/predict") , dataBody);
        
        const result = res.data as string;

        return result.split('\n\n')[0];
    }

    async function getSuggestions(data: string): Promise<string[]> {
        const available = await getHealth();
        if (!available) {
            return [];
        }

        let dataBody: QueryData = {
            prompt : data
        };

        console.log('before');

        // let res = {
        //     data: ['test']
        // }

        const res = await httpRequest.post(cacheBuster("/quick-predict"), dataBody);

        console.log('after');
        console.log(res.data);
        
        return res.data as string[];
    }

    async function getAssists(): Promise<string[]> {
        const available = await getHealth();
        if (!available) {
            return [];
        }

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

    function handleEditorValueChange(editor: mon.editor.IStandaloneCodeEditor, value: string, mark: any) {
        if (quickPredictTimeout != null) {
            console.log('cancelling old suggestions request.');

            clearTimeout(quickPredictTimeout);
        }

        quickPredictTimeout = setTimeout(() => {
            console.log('Getting suggestions.');

            mark.current.suggestions = 1;
            console.log(mark);

            editor.trigger(null, 'editor.action.triggerSuggest', {});
        }, 5000);
    }

    async function execute(editor: mon.editor.IStandaloneCodeEditor) {
        const available = await getHealth();
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
        
        let result : string | null = null;
        data = data.trim();
        
        switch (queryType) {
            case AIQueryType.documentation:
                result = await openAIRequest(data);
                break;

            case AIQueryType.fullCompletion:
                result = await sendRequest(data);
                break;
        }

        if (result == null) {
            return;
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
        getAssists,
        setOAIParams,
        getSuggestions
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
