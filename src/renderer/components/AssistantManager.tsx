import axios, { AxiosInstance } from 'axios';
import React, { createContext } from 'react';

interface QueryData {
    prompt: string;
}

export default class AssistantManager {
    private httpRequest: AxiosInstance;

    constructor() {
        this.httpRequest = axios.create({
            baseURL: "http://localhost:5000",
            headers: {"Content-type": "application/json"}
        });
    }    

    async sendRequest(data: string): Promise<any> {
        let dataBody: QueryData = {
            prompt : data
        };

        return this.httpRequest.post("/predict", dataBody);
    }

}

