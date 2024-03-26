import { ClientServer } from './clientServer';
import { CliInterface } from './cli';
import { Command } from 'commander';

const program = new Command();

const interfaceMappings = {
    cli: CliInterface
} as const

program
    .option('-d, --debug', 'output extra debugging')
    .option('-s, --server', 'The URL of the main agent server', 'http://localhost:3000/')
    .option('-p, --port', 'The port of the interface server', '3005')
    .option('-i, --interface', `The type if interface to spin up. Options: [${Object.keys(interfaceMappings)}]`, Object.keys(interfaceMappings)[0]);

program.parse(process.argv);

const options = program.opts();
const port = parseInt(options.port);
const interfaceArg = options.interface;
const agentServerUrl = options.server;

if (typeof interfaceArg !== 'string' || !(interfaceArg in interfaceMappings)) {
    throw new Error(`Invalid Interface`)
}

if (typeof agentServerUrl !== 'string') {
    // TODO: Full URI check
    throw new Error('Expected agent server to be a valid URL')
}

const Interface = interfaceMappings[interfaceArg as keyof typeof interfaceMappings]

const server = new ClientServer(
    port,
    new Interface(),
    agentServerUrl
)

server.start();
