import {CommandConfig} from '@reskript/core';
import {PlayCommandLineArgs} from './interface';
import run from './run';

const command: CommandConfig<PlayCommandLineArgs> = {
    run,
    command: 'play [target]',
    description: 'Start a playground to debug a certain component',
    args: [
        ['--cwd [value]', 'override current working directory', process.cwd()],
        ['--build-target [value]', 'set build target, default to "dev"', 'dev'],
        ['--port [value]', 'listen on specified port, default to 9999', '9999'],
        ['--host [value]', 'default server host, "localhost" or "loopback" or "ip" or custom host string', 'localhost'],
        ['--setup [value]', 'Import specified module as global setup entry'],
        ['--concurrent-mode', 'Enable react concurrent mode'],
    ],
};

export default command;
