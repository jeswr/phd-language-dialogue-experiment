import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import rdfHandler from '@rdfjs/express-handler'
import { DataFactory, Writer, Parser } from 'n3';
import * as path from 'path';
const { namedNode, defaultGraph } = DataFactory;
import 'dotenv/config';
import { dereferenceToStore } from '../utils/dereferenceToStore';
import { AccessRequestShapeShapeType, UserMessageShapeType } from "../ldo/accessRequest.shapeTypes";
import { WebIdShapeShapeType } from "../ldo/webId.shapeTypes";
import { createLdoDataset, getDataset } from '@ldo/ldo';
import { getSubjects, postDataset } from '../utils';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { n3reasoner } from "eyereasoner";
import { Quad } from '@rdfjs/types';
import { QueryEngine } from "@comunica/query-sparql";
import { v4 } from 'uuid';

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

const { w: webIdString, p: port, u: userDataPath, s: interfaceServer } = res as Awaited<typeof res>;

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

function parseN3(input: string): Quad[] {
    const parser = new Parser({ format: 'text/n3' });
    return parser.parse(input);
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

// This memory storage is a workaround for
// storing 
const memory = new Map<string, string>();

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

        // Don't leave the client hanging
        res.status(200).send('Message Recieved').end();

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

        // Handling permissions
        // We now need to check if the agent representing the user we are negotiating with has permissions
        // to access the required named graphs, and if not, ask for elevanted access.

        // Note for now we are using named graphs as the scope for permissioning + DToU policies,
        // but it is not necessary that this is the case in the future

        // FIXME: Fix the conflated prefixes
        const userDataStore = await userData;
        const engine = new QueryEngine();
        const bindings = await engine.queryBindings(`
        PREFIX acp: <http://www.w3.org/ns/solid/acp#>
        PREFIX acl: <http://www.w3.org/ns/auth/acl#>

        SELECT DISTINCT ?o WHERE {
            ?s
                acp:grant acl:Read ;  
                acp:context [
                  acp:agent <${negotiationWebId}> ;
                  acp:target ?o ;
                ] .
        }`, { sources: [userDataStore] })

        const allowedNamedGraphs = await bindings.map((binding) => binding.get('?o')!.value).toArray()
        const requestNamedGraphs = requiredNamedGraphs.filter((ng) => !allowedNamedGraphs.includes(ng));

        // If there is at least one named graph that needs to be requested, then ask our human interface
        if (requestNamedGraphs.length > 0) {
            console.log('Requesting access to named graphs:', requestNamedGraphs);

            // There needs to be some kind of internal cleanup when this request fails
            // in order to stop user tasks lingering in memory
            await postDataset(interfaceServer, getDataset(createLdoDataset([]).usingType(AccessRequestShapeShapeType).fromJson({
                requestor: {
                    "@id": negotiationWebId
                },
                requestedGraphs: requestNamedGraphs,
                // purposeDescription: `To execute the request [${text}]`,
                purposeDescription: text
            })));
            return;
        }



        // FIXME: Work out how to handle the rest ASYNC (or maybe we should just use the response to the post instead of making all things async?)

        // WARNING: We need to be modelling trust relationships and ensure that the negotiationWebId is a trusted party
        // before continuing here
        // const webIdDataset = await dereferenceToStore(negotiationWebId);
        // const webIdLdoDataset = createLdoDataset([...webIdDataset]);
        // const webid = webIdLdoDataset.usingType(WebIdShapeShapeType).fromSubject(negotiationWebId);
        // console.log('The correspondant agent is:', webid.conversationalAgent['@id']);

        return;
    } catch (e) {
        console.warn('Unable to execute user prompted action', e);
    }

    return res.status(500).send('Unknown error');
});

app.listen(port, () => {
    console.log(`<${webIdString}>'s agent listening at http://localhost:${port}`);
})

