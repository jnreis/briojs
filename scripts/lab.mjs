import { spawn } from 'node:child_process';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const servers = ['dev', 'dev:astro'].map(script =>
    spawn(npm, ['run', script], { stdio: 'inherit', shell: process.platform === 'win32' }));

let stopping = false;
const stop = code => {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    for (const server of servers) if (server.exitCode === null) server.kill('SIGTERM');
};
for (const server of servers) server.on('exit', code => stop(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => stop(0));
