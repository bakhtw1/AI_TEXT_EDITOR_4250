import path from 'path';
import { spawn, spawnSync } from 'child_process';
import fs from 'fs';

const BASE_PATH = path.join(__dirname, 'assistant');

function setup() {
    const alreadySetUp = fs.existsSync(path.join(BASE_PATH, 'venv'));
    if (alreadySetUp) {
        return;
    }

    spawnSync('bash', 
        [   
            path.join(BASE_PATH, 'setup_env.sh'),
            BASE_PATH
        ])
}

function start() {
    setup();

    const serverProcess = spawn('bash', 
        [
            path.join(BASE_PATH, 'run_model_server.sh'),
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