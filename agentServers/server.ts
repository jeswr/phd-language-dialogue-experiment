import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import rdfHandler from '@rdfjs/express-handler'
import { Store, DataFactory, Writer } from 'n3';
import { postDataset } from '../utils/postDataset';
import * as path from 'path';
import { write } from "@jeswr/pretty-turtle";
const { namedNode, defaultGraph } = DataFactory;
import 'dotenv/config';
import { Command } from 'commander';
import { dereferenceToStore } from '../utils/dereferenceToStore';
import { AccessRequestShapeShapeType, AccessGrantsShapeShapeType, UserMessageShapeType } from "../ldo/accessRequest.shapeTypes";
import { createLdoDataset } from '@ldo/ldo';
import { getSubjects } from '../utils';

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

// const yargs = require('yargs/yargs')
// const { hideBin } = require('yargs/helpers')

// const res = yargs(hideBin(process.argv))
//   .command('serve [port]', 'start the server', (yargs) => {
//     return yargs
//       .positional('port', {
//         describe: 'port to bind on',
//         default: 5000
//       })
//   }, (argv) => {
//     if (argv.verbose) console.info(`start server on :${argv.port}`)
//     serve(argv.port)
//   })
//   .option('verbose', {
//     alias: 'v',
//     type: 'boolean',
//     description: 'Run with verbose logging'
//   })
//   .parse()
// const program = new Command();

// program
//     .option('-d, --debug', 'output extra debugging')
//     .option('-s, --server', 'The URL of the interface server <string>', 'http://localhost:3005/')
//     .option('-w, --webid', 'The webId of the agent this server is representing <string>', "http://localhost:3002/nigel/#me")
//     .option('-u, --userData', 'A path for the user data <string>', 'sampleData/nigelSchedule.trig')
//     .option('-p, --port', 'The port of the server <string>');

// program.parse(process.argv.slice(1));

// const options = program.opts();


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
        description: 'The URL of the interface server',
        demandOption: true,
    },
    w: {
        alias: 'webid',
        type: 'string',
        description: 'The webId of the agent this server is representing',
        demandOption: true,
    },
    u: {
        alias: 'userData',
        type: 'string',
        description: 'A path for the user data',
        demandOption: true,
    }
  })
  .parse()


const options = res as Awaited<typeof res>;


const webIdString = options.w;
const userDataPath = options.u;
const port = options.p;

if (typeof webIdString !== 'string') {
    throw new Error('Expected a webId');
}

if (typeof userDataPath !== 'string') {
    throw new Error('Expected a user data path');
}

// Future work: make use of tooling that exposes composed tooling via a universal API
const anthropic = new Anthropic();
const webId = namedNode(webIdString);
const userData = dereferenceToStore(path.join(process.cwd(), userDataPath));
const userDataTrig = userData.then((schedule) => new Writer({ format: 'trig' }).quadsToString([...schedule]));

const app = express();
app.use(rdfHandler());

interface NegotiationResponse {
    negotiationWebId: string;
    requiredNamedGraphs: string[];
}

function parseRequiredNamedGraphs(input: string): NegotiationResponse {
    const parsedResponse = JSON.parse(input);

    const { negotiationWebId, requiredNamedGraphs } = parsedResponse;

    // FIXME: Handle cases where there isn't a WebId here
    if (typeof negotiationWebId !== 'string') {
        throw new Error('No negotiation WebId found');
    }

    if (!Array.isArray(requiredNamedGraphs) || requiredNamedGraphs.some((ng) => typeof ng !== 'string')) {
        throw new Error('No required named graphs found');
    }

    return {
        negotiationWebId,
        requiredNamedGraphs
    }
}

app.post('/', async (req, res) => {
    const dataset = await req.dataset?.();

    if (!dataset) {
        return res.status(400).send('Invalid request, expected a dataset to be posted');
    }

    const ldoDataset = createLdoDataset([...dataset]);
    const subjects = getSubjects(ldoDataset);

    try {
        // Collecting the user message
        const { text } = ldoDataset.usingType(UserMessageShapeType).fromSubject(webId);

        if (typeof text !== 'string') {
            throw new Error('No text found');
        }

        console.log('The user query is:', text);
        // Work out what user data, and negotiating WebId
        // is required to answer the message
        // for now we use prompt injection, but in the longer term it would
        // probably be more suitable to have user data in something like
        // vector databases

        // Note that the approach we are currently taking here is essentially
        // Retrieval Agumented Generation with the LLM
        const question = 'Given the following prompt:\n' +
        '---\n' +
        text + '\n' +
        '---\n' +
        `You are representing a user with the WebId <${webIdString}>\n` +
        'Please return a JSON object containing exactly the smallest set of named graphs which are required to answer this question and the WebId of who we need to negotiate with to answer the prompt, if any.\n' +
        // 'Please return a JSON object containing exactly the smallest set of named graphs which are required to answer this question ' +
        // 'and the WebId of who we need to negotiate with to answer the prompt, if any.\n' +
        // FIXME: We should be doing structured reasoning to establish the finite set of parties we can negotiate with and
        // provide them up front
        `The WebId of anyone we negotiate with must be related to <${webIdString}> via the <http://schema.org/knows> predicate.\n` +
        'The JSON object should take the form `{ negotiationWebId: /* string webId of who to negotiate with */, requiredNamedGraphs: /* array of named graphs needed to answer the query */ }`\n' +
        // TODO: Include something like this when we are trying to generalise away from the 1-1 negotiation case
        // `If there is no WebId found that is related to <${webIdString}> via <http://schema.org/knows> and can provide the information to answer the prompt, please return an empty string for negotiationWebId.` +
        'I want to parse this array directly so please do not include anything else in the response.\n';

        const { content: [{ text: ngText }] } = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4096,
            temperature: 0,
            messages: [
                {
                    role: 'user',
                    content:  [
                        {
                            text: question,
                            type: 'text'
                        },
                        {
                            text: await userDataTrig,
                            type: 'text'
                        }
                    ]
                }
            ],
        });

        // FIXME: With Claude 3 sonnet we are often seeing the colleagues graph turn up as well, we should
        // find a way of signalling that we usually don't need to do this.
        const { negotiationWebId, requiredNamedGraphs } = parseRequiredNamedGraphs(ngText);
        console.log('The WebId + named graphs required to answer the user queries are:', { negotiationWebId, requiredNamedGraphs });

        // WARNING: We need to be modelling trust relationships and ensure that the negotiationWebId is a trusted party
        // before continuing here
        const webIdDataset = await dereferenceToStore(negotiationWebId);
        const webIdLdoDataset = createLdoDataset([...webIdDataset]);
        console.log('The WebId dataset is:', webIdLdoDataset);

    

        // Work out which user we need to negotiate with
        // const question = 'Given the following prompt:\n' +
        // '---\n' +
        // text + '\n' +
        // '---\n' +
        // 'Please return a JSON array contaning exactly the smallest set of named graphs which are required to answer this question.\n' +
        // 'I want to parse this array directly so please do not include anything else in the response.\n';

        // const { content: [{ text: ngText }] } = await anthropic.messages.create({
        //     model: 'claude-3-sonnet-20240229',
        //     max_tokens: 4096,
        //     temperature: 0,
        //     messages: [
        //         {
        //             role: 'user',
        //             content:  [
        //                 {
        //                     text: question,
        //                     type: 'text'
        //                 },
        //                 {
        //                     text: await userDataTrig,
        //                     type: 'text'
        //                 }
        //             ]
        //         }
        //     ],
        // });
    } catch (e) {
        console.warn('Unable to execute user prompted action', e);
    }

    return res.status(500).send('Unknown error');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

