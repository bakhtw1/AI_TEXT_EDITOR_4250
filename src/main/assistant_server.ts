import path from 'path';
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';
import os from 'os';

const BASE_PATH = path.join(__dirname, 'assistant');
const SHELL = os.platform() === "win32" ? "powershell.exe" : "bash";

const SETUP_SCRIPT = os.platform() === "win32" ? "setup_env.bat" : "setup_env.sh";
const RUN_SCRIPT = os.platform() === "win32" ? "run_model_server.bat" : "run_model_server.sh";

function setup() {
    const alreadySetUp = fs.existsSync(path.join(BASE_PATH, 'venv'));
    if (alreadySetUp) {
        console.log("venv already set up");
        return;
    }
    console.log("setting up venv"); 
    const setupProcess = spawnSync(SHELL, 
        [   
            path.join(BASE_PATH, SETUP_SCRIPT),
            BASE_PATH
        ]);
}

function start() {
    setup();
    console.log(SHELL);

    const serverProcess = spawn(SHELL, 
        [
            path.join(BASE_PATH, RUN_SCRIPT),
            BASE_PATH
        ]);
    
    serverProcess.stdout.on('data', (data) => {
        console.log(`serverProcess stdout:\n${data}`);
    });
    
    serverProcess.stderr.on('data', (data) => {
        console.error(`serverProcess stderr:\n${data}`);
    });
}

export default {
    start
}