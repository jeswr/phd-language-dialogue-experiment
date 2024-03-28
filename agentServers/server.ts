import { QueryEngine } from "@comunica/query-sparql";
import { ChatAnthropic, } from "@langchain/anthropic";
import { UpstashRedisCache } from "@langchain/community/caches/upstash_redis";
import { ShapeType, createLdoDataset, getDataset } from '@ldo/ldo';
import rdfHandler from '@rdfjs/express-handler';
import { DatasetCore, Quad } from '@rdfjs/types';
import 'dotenv/config';
import express from 'express';
import * as fs from 'fs';
import { DataFactory, Store, Writer, Parser as N3Parser } from 'n3';
import * as path from 'path';
import { v4 } from 'uuid';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs/yargs';
import { AccessGrantsShapeShapeType, AccessRequestShapeShapeType, UserMessageShapeType } from "../ldo/accessRequest.shapeTypes";
import { WebIdShapeShapeType } from "../ldo/webId.shapeTypes";
import { getSubjects, postDataset } from '../utils';
import { dereferenceToStore } from '../utils/dereferenceToStore';
import { EventConfirmationShapeShapeType, EventShapeShapeType, PaymentShapeShapeType } from '../ldo/conclusions.shapeTypes';
import { shapeFromDataset, shapeMatches } from "../utils/shapeFromDataset";
import { displayEventShape } from "../humanInterfaces/conclusions";
import { write } from "@jeswr/pretty-turtle";
import { skolemiseDataset } from "../utils/skolemize";
import { Generation } from "@langchain/core/outputs";
import md5 from 'md5';
import { EventShape } from "../ldo/conclusions.typings";

const { namedNode, defaultGraph, blankNode, quad, literal } = DataFactory;

class HookedCache extends UpstashRedisCache {
    async lookup(prompt: string, llmKey: string): Promise<Generation[] | null> {
        const res = await super.lookup(prompt, llmKey);
        // console.log('The response is:', res);
        // throw new Error('Method not implemented.');
        const json = JSON.stringify({ prompt, llmKey }, null, 2);
        const loc = path.join(__dirname, '..', 'prompts', md5(json) + '.json')
        if (!fs.existsSync(loc)) {
            fs.writeFileSync(loc, json);
        } else if (JSON.parse(fs.readFileSync(loc, 'utf-8')).response) {
            const res = JSON.parse(fs.readFileSync(loc, 'utf-8')).response;
            // @ts-ignore
            return [{text:  res, message: { content: res } }];
        }
        // if (res) {
        //     return res;
        // }
        throw new Error('Method not implemented.');
    }
}

const cache = new HookedCache({
  config: {
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  },
});
const model = new ChatAnthropic({
    cache,
    // modelName: 'claude-3-sonnet-20240229',
    modelName: 'claude-3-opus-20240229-man',
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
const webId = namedNode(webIdString);
const userData = dereferenceToStore(path.join(process.cwd(), userDataPath));
const userDataTrig = userData.then((schedule) => new Writer({ format: 'trig' }).quadsToString([...schedule]));

const app = express();
app.use(rdfHandler());

interface NegotiationResponse extends NegotiationResponseWithoutWebid {
    negotiationWebId: string;
}

interface NegotiationResponseWithDescription extends NegotiationResponseWithoutWebid {
    description?: string;
}

interface NegotiationResponseWithoutWebid {
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

function parseRequiredNamedGraphsWithoutWebid(input: string): NegotiationResponseWithDescription {
    const parsedResponse = JSON.parse(input);

    const { requiredNamedGraphs, description } = parsedResponse;

    if (!Array.isArray(requiredNamedGraphs) || requiredNamedGraphs.some((ng) => typeof ng !== 'string')) {
        throw new Error('No required named graphs found');
    }

    if (typeof description !== 'string' && typeof description !== "undefined") {
        throw new Error("Description must be a string or undefined");
    }

    return {
        requiredNamedGraphs,
        description
    }
}

interface ProcessInformation {
    prompt: string;
    // The documents that are permitted to be accessed
    // by the negotiationWebId
    permittedDocuments?: string[];
    negotiationWebId?: string;
    negotiationAgent?: string;
    negotiatorData?: DatasetCore;
    callNumber: number;
}

// This memory storage is a workaround for
// storing 
const memory: Record<string, ProcessInformation> = {};

const conclusions = fs.readFileSync(path.join(process.cwd(), 'shapes', 'conclusions.shaclc'), 'utf-8');

function stripNamedGraphs(quads: Quad[]): Quad[] {
    return quads.map((quad) => {
        if (quad.graph.termType === 'DefaultGraph') {
            return quad;
        }
        return DataFactory.quad(quad.subject, quad.predicate, quad.object, defaultGraph());
    });

}

async function continueProcess(processId: string) {
    // This SHOULD NOT be the exit criteria in the future, it is just a workaround for now
    const { prompt, negotiationWebId, permittedDocuments, negotiatorData, negotiationAgent } = memory[processId];
    if (negotiatorData) {
        const negotiatorTrig = new Writer({ format: 'trig' }).quadsToString(stripNamedGraphs([...negotiatorData]));
        if (!permittedDocuments) {
            throw new Error('No permitted documents found');
        }
        const agentData = new Writer({ format: 'trig' }).quadsToString(stripNamedGraphs([...await getUserData(permittedDocuments)]));

        // By this point we should have all the data we need to answer the prompt
        const question = 'Consider the following prompt:\n' +
        '-'.repeat(100) + '\n' +
        prompt + '\n' +
        '-'.repeat(100) + '\n' +
        `You are representing a user with the WebId <${webIdString}>\n` +
        'Here is their data they have chosen to disclose\n' +
        '-'.repeat(100) + '\n' +
        agentData + '\n' +
        '-'.repeat(100) + '\n' +
        `You are negotiating with an agent with the WebId <${negotiationWebId}>\n` +
        'Here is the data they have chosen to disclose\n' +
        '-'.repeat(100) + '\n' +
        negotiatorTrig + '\n' +
        '-'.repeat(100) + '\n' +
        'Please formulate an answer to the prompt using the data provided above.\n' +
        'The message you send should be definitive and not require any follow up from the agent you are negotiating with.\n' +
        'The response should be serialized in text/turtle and should conform to one of the following SHACL shapes.\n' +
        'This response will be parsed directly as a text/turtle document so do not include anything else in the response\n' +
        'other than the turtle file contents\n' +
        '-'.repeat(100) + '\n' +
        conclusions + '\n' +
        '-'.repeat(100) + '\n';

        const questions: ["user" | "assistant", string][]  = [["user", question]];

        const { content: ngText } = await model.invoke(questions);
        if (typeof ngText !== 'string') {
            throw new Error('No negotiation response found');
        }

        let dataset: DatasetCore | undefined = undefined;
        let shaped: EventShape | undefined = undefined;

        for (let i = 0; i < 5; i++) {
            const { content: ngText } = await model.invoke(questions);
            if (typeof ngText !== 'string') {
                throw new Error('No negotiation response found');
            }
            questions.push(["assistant", ngText]);
            try {
                dataset = skolemiseDataset(new Store(new N3Parser().parse(ngText)));
                const errs = [];
                
                for (const subject of getSubjects(dataset)) {
                    try {
                        shaped = shapeFromDataset(EventShapeShapeType, dataset, subject);
                        break;
                    } catch (e) {
                        errs.push(e);
                        // Do nothing, not all subjects will match every shape
                    }
                }

                if (!shaped) {
                    questions.push(["user", `Unable to validate the data against the shapes [${errs.join(', ')}]. Please try generating the output again.`])
                } else {
                    break;
                }

                // break;
            } catch (e) {
                questions.push(["user", `Unable to parse response, with the error [${e}]. Please try generating the output again.`])
                console.warn('Unable to parse response', e);
            }
        }

        if (!dataset || !shaped) {
            console.warn('Unable to parse response');
            throw new Error('Unable to parse response');
        }

        // const dataset = new Store(new N3Parser().parse(ngText));
        // console.log('The response to the prompt is:', ngText, dataset);


        // This is where we need rules in order to say things like
        // "in order to commit to an action of this shape, we first need to have a user confirm using x method"
        // long term this should probably be all rules based rather than shapes based
        // but it may be possible to convert the shapes to rules

        // HACK! Skolemise the dataset because the validation library
        // expects namedNodes as input
        console.log('Done', await write([...dataset]));

        // Here we are hard coding the rules for the event shape here in JS (for now...)
        // for (const event of shapeMatches(EventShapeShapeType, dataset)) {
        //     console.log('Event:', event, displayEventShape(shaped));
        // }
        console.log('Event:', shaped, displayEventShape(shaped));

        await postDataset(interfaceServer, getDataset(createLdoDataset([]).usingType(EventConfirmationShapeShapeType).fromJson({
            // THIS IS A HACK! We should be able to send blank nodes
            "@id": "urn:uuid:" + v4(),
            processId,
            // TODO: Raise an upstream issue with LDO around the fact that the contents of this shape are not
            // returned when we do `getDataset`
            event: shaped,
        })));
        return;
    }

    // TODO: Implement an escape case when we don't have enough data to continue
    console.log('Continuing process:', processId, memory[processId]);

    memory[processId].callNumber += 1;

    // const { prompt, negotiationWebId, permittedDocuments } = memory[processId];
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
    const allRelevantData = await getUserData(permittedDocuments);

    const data = new Writer({ format: 'trig' }).quadsToString([...allRelevantData]);

    // TODO(IMPORTANT!): Ground the query in relevant system information such as the current
    // time
    const question = 'Consider the following prompt:\n' +
    '-'.repeat(100) + '\n' +
    memory[processId].prompt + '\n' +
    '-'.repeat(100) + '\n' +
    `You are representing a user with the WebId <${webIdString}>\n` +
    // `Using the data provided in the following message, please formulate a question to ask an LLM agent representing <${negotiationWebId}> in order to achieve the outcome\n` +
    `Using the data provided below, please formulate a question to ask an LLM agent representing <${negotiationWebId}> in order to achieve the outcome\n` +
    'expressed in the prompt. The message you send should include any data that will be needed for the agent to answer the prompt.\n' +
    'Where possible you should use the attached data to make the question as detailed, and actionable as possible\n' +
    `Please do not include any other text in your other than what should be forwarded to the LLM agent representing <${negotiationWebId}>.\n` +
    '-'.repeat(100) + '\n' +
    data + '\n' +
    '-'.repeat(100) + '\n';

    const { content: ngText } = await model.invoke(question);
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
        quad(namedNode(webIdString), namedNode('http://example.org/message'), literal(ngText)),
    ]))
    // FIXME: We should reach a point where after this post we don't need to retain context of
    // the current conversation, and any context that is required is sent back by the agent we are
    // conversing with
}

app.post('/agent', async (req, res) => {
    const dataset = await req.dataset?.();
    // console.log('Agent request recieved');
    if (!dataset) {
        return res.status(400).send('Invalid request, expected a dataset to be posted');
    }
    // console.log(...dataset);
    const message = [...dataset.match(null, namedNode('http://example.org/message'), null, null)];

    if (message.length !== 1) {
        return res.status(400).send('Invalid request, expected exactly one message to be posted');
    }

    res.status(200).send('Message Recieved').end();

    dataset.delete(message[0]);
    const negotiationWebId = message[0].subject.value;

    // FIXME: Check if every call to /agent should be the start of a new process
    const processId = v4();
    memory[processId] = {
        prompt: message[0].object.value,
        callNumber: 0,
        negotiationWebId,
        negotiatorData: dataset,
    };

    const question = 'You are an agent representing the user with WebId <' + webIdString + '>.\n' +
    'You have received a message from another agent representing the user <' + negotiationWebId + '>.\n' +
    'The message is.\n' +
    '-'.repeat(100) + '\n' +
    message[0].object.value +
    '-'.repeat(100) + '\n' + 
    'Here is the data that the agent with WebId <' + negotiationWebId + '> has sent you:\n' +
    '-'.repeat(100) + '\n' +
    new Writer({ format: 'trig' }).quadsToString([...dataset]) + '\n' +
    '-'.repeat(100) + '\n' + 
    'Here is the data that the user you are representing (<' + webIdString + '>) has\n' +
    '-'.repeat(100) + '\n' +
    await userDataTrig + '\n' +
    '-'.repeat(100) + '\n' + 
    'Is any information from the user you are representing (<' + webIdString + '>) required to answer the message?\n' +
    'If so, please return a JSON object containing exactly the smallest set of named graphs which are required to answer this question.\n' +
    'If information is required, please also include a short (maximum 15 word) description of why the information is needed for the purpose of\n' +
    // For securty / safety this should also include deterministically generated information from the agreed upon
    'requesting to access the data from the agent you are representing\n' +
    'The JSON object should take the form `{ \"requiredNamedGraphs\": /* array of named graphs needed to answer the query */, \"description\": /* description of why the information is needed */ }`\n' +
    'If no information is required from the user you are representing, please return an empty array.\n' +
    'I want to parse this array directly so please do not include anything else in the response.\n'

    const { content: ngText } = await model.invoke(question);
    if (typeof ngText !== 'string') {
        throw new Error('No negotiation response found');
    }

    const { requiredNamedGraphs, description } = parseRequiredNamedGraphsWithoutWebid(ngText);
    console.log('The named graphs required to answer the agent query are:', requiredNamedGraphs);

    //////////////////////// FIXME!!! Remove this copy/pasted code ////////////////////////

    // FIXME: With Claude 3 sonnet we are often seeing the colleagues graph turn up as well, we should
    // find a way of signalling that we usually don't need to do this.
    // const { negotiationWebId, requiredNamedGraphs } = parseRequiredNamedGraphs(ngText);
    // memory[processId].negotiationWebId = negotiationWebId;
    // console.log('The WebId + named graphs required to answer the user queries are:', { negotiationWebId, requiredNamedGraphs });

    // Handling permissions
    // We now need to check if the agent representing the user we are negotiating with has permissions
    // to access the required named graphs, and if not, ask for elevanted access.

    // Note for now we are using named graphs as the scope for permissioning + DToU policies,
    // but it is not necessary that this is the case in the future

    // FIXME: Fix the conflated prefixes
    const { permittedDocuments, requestNamedGraphs } = await getDocumentStates(negotiationWebId, requiredNamedGraphs);
    memory[processId].permittedDocuments = permittedDocuments;


    // If there is at least one named graph that needs to be requested, then ask our human interface
    if (requestNamedGraphs.length > 0) {
        if (!description) {
            throw new Error('No description found');
        }
        console.log('Requesting access to named graphs:', requestNamedGraphs);

        // There needs to be some kind of internal cleanup when this request fails
        // in order to stop user tasks lingering in memory
        await postDataset(interfaceServer, getDataset(createLdoDataset([]).usingType(AccessRequestShapeShapeType).fromJson({
            // THIS IS A HACK! We should be able to send blank nodes
            // but currently the shex validation we have requires IRIs
            "@id": "urn:uuid:" + v4(),
            requestor: {
                "@id": negotiationWebId
            },
            requestedGraphs: requestNamedGraphs.map((ng) => ({ "@id": ng })),
            purposeDescription: description,
            processId: processId
        })));
        return;
    }

    
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
        memory[processId] = { prompt: text, callNumber: 0 };

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
        'The JSON object should take the form `{ \"negotiationWebId\": /* string webId of who to negotiate with */, \"requiredNamedGraphs\": /* array of named graphs needed to answer the query */ }`\n' +
        // TODO: Include something like this when we are trying to generalise away from the 1-1 negotiation case
        // `If there is no WebId found that is related to <${webIdString}> via <http://schema.org/knows> and can provide the information to answer the prompt, please return an empty string for negotiationWebId.` +
        'I want to parse this array directly so please do not include anything else in the response.\n' +
        '-'.repeat(100) + '\n' +
        await userDataTrig + '\n' +
        '-'.repeat(100) + '\n';

        const { content: ngText } = await model.invoke(question);
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
        const { permittedDocuments, requestNamedGraphs } = await getDocumentStates(negotiationWebId, requiredNamedGraphs);
        memory[processId].permittedDocuments = permittedDocuments;


        // If there is at least one named graph that needs to be requested, then ask our human interface
        if (requestNamedGraphs.length > 0) {
            console.log('Requesting access to named graphs:', requestNamedGraphs);

            // There needs to be some kind of internal cleanup when this request fails
            // in order to stop user tasks lingering in memory
            await postDataset(interfaceServer, getDataset(createLdoDataset([]).usingType(AccessRequestShapeShapeType).fromJson({
                // THIS IS A HACK! We should be able to send blank nodes
                // but currently the shex validation we have requires IRIs
                "@id": "urn:uuid:" + v4(),
                requestor: {
                    "@id": negotiationWebId
                },
                requestedGraphs: requestNamedGraphs.map((ng) => ({ "@id": ng })),
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

        const { negotiationWebId } = memory[processId];
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
                        DataFactory.quad(context, namedNode('http://www.w3.org/ns/solid/acp#target'), namedNode(graph['@id'])),
                        DataFactory.quad(context, namedNode('http://www.w3.org/ns/solid/acp#agent'), namedNode(negotiationWebId))
                    ]);
                }
                memory[processId].permittedDocuments?.push(...grantedGraphs.map((graph) => graph['@id']));
            } else if (modes.some((mode) => mode['@id'] === 'ReadOnce')) {
                memory[processId].permittedDocuments?.push(...grantedGraphs.map((graph) => graph['@id']));
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

async function getUserData(permittedDocuments: string[]) {
    const userDataStore = await userData;
    const allRelevantData = new Store();
    for (const document of permittedDocuments) {
        allRelevantData.addQuads([...userDataStore.match(null, null, null, namedNode(document))]);
    }
    return allRelevantData;
}

async function getDocumentStates(negotiationWebId: string, requiredNamedGraphs: string[]) {
    const allowedNamedGraphs = await getAllowedGraphs(negotiationWebId);
    const permittedDocuments = requiredNamedGraphs.filter((ng) => allowedNamedGraphs.includes(ng));
    const requestNamedGraphs = requiredNamedGraphs.filter((ng) => !allowedNamedGraphs.includes(ng));
    return { permittedDocuments, requestNamedGraphs };
}

// FIXME: Make this evaluate ACLs properly, in particular, we
// are not including cases such as where the read access is public
async function getAllowedGraphs(negotiationWebId: string) {
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
        }`, { sources: [userDataStore] });

    const allowedNamedGraphs = await bindings.map((binding) => {
        console.log('The binding is:', ...binding.values());
        return binding.get('o')!.value;
    }).toArray();
    return allowedNamedGraphs;
}
