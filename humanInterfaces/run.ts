import { ClientServer } from './clientServer';
import { CliInterface } from './cli';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

const interfaceMappings = {
    cli: CliInterface
} as const

const res = yargs(hideBin(process.argv))
  .options({
    p: {
        alias: 'port',
        type: 'number',
        description: 'The port of the server',
        demandOption: true,
    },
    s: {
        alias: 'server',
        type: 'string',
        description: 'The URL of the agent server',
        demandOption: true,
    },
    w: {
        alias: 'webid',
        type: 'string',
        description: 'The webId of the agent this server is representing',
        demandOption: true,
    },
    i: {
        alias: 'interface',
        type: 'string',
        description: 'The type if interface to spin up',
        demandOption: true,
        choices: Object.keys(interfaceMappings)
    }
  })
  .parse()

const { w: webIdString, p: port, i: interfaceArg, s: agentServerUrl } = res as Awaited<typeof res>;

const Interface = interfaceMappings[interfaceArg as keyof typeof interfaceMappings]

const server = new ClientServer(
    port,
    new Interface(),
    agentServerUrl,
    webIdString
)

server.start();
