import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import rdfHandler from '@rdfjs/express-handler'
import { Store, DataFactory, Writer } from 'n3';
import { postDataset } from '../utils/postDataset.js';
import dereference, { type IDereferenceOptions } from 'rdf-dereference';
import { promisifyEventEmitter } from 'event-emitter-promisify';
import * as path from 'path';
import { write } from "@jeswr/pretty-turtle";
const { namedNode, defaultGraph } = DataFactory;
import 'dotenv/config';

// FIXME: Work out why this default thing is happening
function deref (url: string, options: IDereferenceOptions) {
    // @ts-ignore
    return dereference.default.dereference(url, options);
}

async function dereferenceToStore(file: string) {
    const store = new Store();
    return promisifyEventEmitter(store.import((await deref(file, { localFiles: true })).data), store);
}

// Future work: make use of tooling that exposes composed tooling via a universal API
const anthropic = new Anthropic();
const alice = express();
const bob = express();

alice.use(rdfHandler());
bob.use(rdfHandler());

alice.use(express.json());
bob.use(express.json());

const AGENT = namedNode("https://www.omg.org/spec/Commons/PartiesAndSituations/Agent");
const AGENT_OF = namedNode("https://www.omg.org/spec/Commons/PartiesAndSituations/actsOnBehalfOf");

const aliceSchedule = dereferenceToStore(path.join(process.cwd(), 'aliceSchedule.jsonld'));
const bobSchedule = dereferenceToStore(path.join(process.cwd(), 'bobSchedule.jsonld'));

const junSchedule = dereferenceToStore(path.join(process.cwd(), 'sampleData', 'junSchedule.jsonld'));
const nigelSchedule = dereferenceToStore(path.join(process.cwd(), 'sampleData', 'nigelSchedule.jsonld'));

const junTrig = junSchedule.then((schedule) => new Writer({ format: 'trig' }).quadsToString([...schedule]));
const nigelTrig = junSchedule.then((schedule) => new Writer({ format: 'trig' }).quadsToString([...schedule]));

const prefixes = {
    schema: 'http://schema.org/',
    ex: 'http://example.org/'
};
const bobttl = bobSchedule.then((schedule) => write([...schedule], { prefixes }));
const alicettl = aliceSchedule.then((schedule) => write([...schedule], { prefixes }));

// Use the store in your code as needed
alice.post('/agents', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Alice\n", dataset?.size);

    // return res.json({
    //     message: 'Hello from Alice'
    // });
});

alice.post('/humans', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Alice Humans\n", dataset?.size);
    
    
    // return res.json({
    //     message: 'Hello from Alice'
    // });


    
});

bob.post('/agents', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Bob\n", dataset?.size);
    // return res.json({
    //     message: 'Hello from Bob'
    // });
});

bob.post('/humans', async (req, res) => {
    console.log("For the record bobs schedule is\n", await bobttl)      ;

    const dataset = await req.dataset?.();
    if (dataset) {
        console.log("Dataset posted to Bob Humans", ...dataset);
    }
    const messages = dataset?.match(namedNode('http://example.org/bob'), namedNode('http://schema.org/text'));
    console.log("Dataset posted to Bob Humans", messages);

    if (messages?.size !== 1) {
        return res.status(400).send(`Expected exactly one message, but got ${messages?.size} messages`);
    }

    const [message] = [...messages];
    if (message.object.termType !== 'Literal') {
        return res.status(400).send('Expected message to be a literal');
    }

    const question = `
    I have a human who wants to ask the following question:

    ---
    ${message.object.value}
    ---

    What data do you need to answer this question
    `

    const result = await anthropic.messages.create({
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
                        text: await alicettl,
                        type: 'text'
                    }
                ]
            }
        ],
    });

    console.log(result.content.length);
    console.log(result.content[0].text);

    // message.object.value;

    // if (!messages?.has(namedNode('http://example.org/bob'), namedNode('http://example.org/text'), namedNode('http://example.org/alice'))) {
    //     return res.status(400).send('Expected message from Alice');
    // }



    // console.log("Dataset posted to Bob Humans", ...dataset?.match());
    res.status(200).send(result.content[0].text + '\n');

    // return res.json({
    //     // message: 'Hello from Bob'
    // });
});

alice.listen(3000, () => {
    console.log('Alice is listening on port 3000');
});

bob.listen(3001, () => {
    console.log('Bob is listening on port 3001');
});

// async function main() {
//     const anthropic = new Anthropic();
    
    // const result = anthropic.messages.create({
    //     model: 'claude-3-sonnet-20240229',
    //     max_tokens: 4096,
    //     temperature: 0,
    //     messages: [
    //         {
    //             role: 'user',
    //             content: 'Once upon a time, in a land far, far away, there was a princess named Alice. She was a very curious'
    //         }
    //     ],
    // });

//     console.log(result);
// }

postDataset('http://localhost:3000/agents', new Store([
    DataFactory.quad(DataFactory.namedNode('http://localhost:3000/agents'), AGENT_OF, DataFactory.namedNode('http://example.org/alice'), defaultGraph())
]));
