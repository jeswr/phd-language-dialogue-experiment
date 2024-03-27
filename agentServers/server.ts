import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import rdfHandler from '@rdfjs/express-handler'
import { DataFactory, Writer, Parser, Store } from 'n3';
import * as path from 'path';
const { namedNode, defaultGraph, blankNode, quad, literal } = DataFactory;
import 'dotenv/config';
import { dereferenceToStore } from '../utils/dereferenceToStore';
import { AccessGrantShapeShapeType, AccessGrantsShapeShapeType, AccessRequestShapeShapeType, UserMessageShapeType } from "../ldo/accessRequest.shapeTypes";
import { WebIdShapeShapeType } from "../ldo/webId.shapeTypes";
import { createLdoDataset, getDataset } from '@ldo/ldo';
import { getSubjects, postDataset } from '../utils';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { n3reasoner } from "eyereasoner";
import { Quad, NamedNode } from '@rdfjs/types';
import { QueryEngine } from "@comunica/query-sparql";
import { v4 } from 'uuid';
import { OpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { Redis } from "@upstash/redis";
import { UpstashRedisCache } from "@langchain/community/caches/upstash_redis";
// import { Lo } from "@langchain/community/caches/";
import https from 'https';

const client = Redis.fromEnv({
  agent: new https.Agent({ keepAlive: true }),
});

const cache = new UpstashRedisCache({ client });
const model = new ChatAnthropic({
    cache,
    modelName: 'claude-3-sonnet-20240229',
    maxTokens: 4096,
    temperature: 0,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
});

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

interface ProcessInformation {
    prompt: string;
    // The documents that are permitted to be accessed
    // by the negotiationWebId
    permittedDocuments?: string[];
    negotiationWebId?: string;
    negotiationAgent?: string;
}

// This memory storage is a workaround for
// storing 
const memory: Record<string, ProcessInformation> = {};

async function continueProcess(processId: string) {
    // TODO: Implement an escape case when we don't have enough data to continue
    console.log('Continuing process:', processId, memory[processId]);

    const { prompt, negotiationWebId, permittedDocuments } = memory[processId];
    console.log('The prompt is:', prompt, negotiationWebId, permittedDocuments);

    if (!negotiationWebId) {
        throw new Error('No negotiation WebId found');
    }

    if (!permittedDocuments) {
        throw new Error('No permitted documents found');
    }

    // Here we collect the data from all graphs that we are allowed to use
    // and then we can use this data to answer the prompt
    // Note that this introduces the (very strict) assumption that
    // all of the documents contain data which is globally true
    const userDataStore = await userData;
    const allRelevantData = new Store();
    for (const document of permittedDocuments) {
        allRelevantData.addQuads([...userDataStore.match(null, null, null, namedNode(document))]);
    }

    const data = new Writer({ format: 'trig' }).quadsToString([...allRelevantData]);

    // TODO(IMPORTANT!): Ground the query in relevant system information such as the current
    // time
    const question = 'Consider the following prompt:\n' +
    '---\n' +
    memory[processId].prompt + '\n' +
    '---\n' +
    `You are representing a user with the WebId <${webIdString}>\n` +
    // 'Here is their data they have chosen to disclose' +
    // '---\n' +
    // data + '\n' +
    // '---\n' +
    `Using the data provided in the following message, please formulate a question to ask an LLM agent representing <${negotiationWebId}> in order to achieve the outcome\n` +
    'expressed in the prompt. The message you send should include any data that will be needed for the agent to answer the prompt.\n' +
    'Wher possible you should use the attached data to make the question as detailed, and actionable as possible\n' +
    `Please do not include any other text in your other than what should be forwarded to the LLM agent representing <${negotiationWebId}>.\n`;

    const ngText = await model.invoke([
        question,
        data
    ]);

    if (typeof ngText !== 'string') {
        throw new Error('No negotiation response found');
    }

    const webIdDataset = await dereferenceToStore(negotiationWebId);
    const webIdLdoDataset = createLdoDataset([...webIdDataset]);
    const webid = webIdLdoDataset.usingType(WebIdShapeShapeType).fromSubject(negotiationWebId);
    console.log('The correspondant agent is:', webid.conversationalAgent['@id']);
    console.log('The question to ask the agent is:', ngText);

    // FIXME: Use a shape here and add the correct modelling for the user, conversational agent
    // and who is saying what
    // Also note that the original input prompted is "leaked" in the negotiation so we
    // need to work out how to allow privacy policies around that information to be set
    return postDataset(webid.conversationalAgent['@id'], new Store([
        ...allRelevantData,
        // TODO: Add in the correct modelling 
        quad(namedNode(webIdString), namedNode('http://example.org/message'), literal(question)),
    ]))
}

app.post('/agent', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log('Agent request recieved');
    if (!dataset) {
        return res.status(400).send('Invalid request, expected a dataset to be posted');
    }
    console.log(...dataset);
});

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

        // Becasue we have more "statically defined" flows for now we are
        // using an id for each exchange. I imagine this is something we
        // will want to change in the future.
        const processId = v4();
        memory[processId] = { prompt: text };

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

        const ngText = await model.invoke([
            question,
            await userDataTrig
        ]);

        if (typeof ngText !== 'string') {
            throw new Error('No negotiation response found');
        }

        // FIXME: With Claude 3 sonnet we are often seeing the colleagues graph turn up as well, we should
        // find a way of signalling that we usually don't need to do this.
        const { negotiationWebId, requiredNamedGraphs } = parseRequiredNamedGraphs(ngText);
        memory[processId].negotiationWebId = negotiationWebId;
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
        memory[processId].permittedDocuments = requiredNamedGraphs.filter((ng) => allowedNamedGraphs.includes(ng));
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
                purposeDescription: text,
                processId
            })));
            return;
        }

        memory[processId].permittedDocuments = requiredNamedGraphs;
        continueProcess(processId);

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

    try {
        // Collecting the access request response
        const { grants, processId } = ldoDataset.usingType(AccessGrantsShapeShapeType).fromSubject(webId);

        if (!Array.isArray(grants)) {
            throw new Error('No grants found');
        }

        if (typeof processId !== 'string') {
            throw new Error('No processId found');
        }

        memory[processId].permittedDocuments ??= [];

        const { negotiationWebId, permittedDocuments } = memory[processId];
        if (!negotiationWebId) {
            throw new Error('No negotiation WebId found');
        }

        for (const grant of grants) {
            const { grantedGraphs, modes } = grant;

            if (modes.some((mode) => mode['@id'] === 'Read')) {
                for (const graph of grantedGraphs) {
                    const bn = blankNode();
                    const context = blankNode();
                    (await userData).addQuads([
                        DataFactory.quad(bn, namedNode('http://www.w3.org/ns/solid/acp#grant'), namedNode('http://www.w3.org/ns/auth/acl#Read')),
                        DataFactory.quad(bn, namedNode('http://www.w3.org/ns/solid/acp#context'), context),
                        DataFactory.quad(context, namedNode('http://www.w3.org/ns/solid/acp#target'), namedNode(graph)),
                        DataFactory.quad(context, namedNode('http://www.w3.org/ns/solid/acp#agent'), namedNode(negotiationWebId))
                    ]);
                }
                memory[processId].permittedDocuments?.push(...grantedGraphs);
            } else if (modes.some((mode) => mode['@id'] === 'ReadOnce')) {
                memory[processId].permittedDocuments?.push(...grantedGraphs);
            }
        }

        // Don't leave the client hanging
        res.status(200).send('Message Recieved').end();
        return continueProcess(processId);
    } catch (e) {
        console.warn('Unable to execute access request action', e);
    }

    return res.status(500).send('Unknown error');
});

app.listen(port, () => {
    console.log(`<${webIdString}>'s agent listening at http://localhost:${port}`);
})

