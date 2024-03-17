import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import rdfHandler from '@rdfjs/express-handler'
import { Store, DataFactory } from 'n3';
import { postDataset } from './datasetFetch.js';
const { namedNode, defaultGraph } = DataFactory;
import 'dotenv/config';

const anthropic = new Anthropic();
const alice = express();
const bob = express();

alice.use(rdfHandler());
bob.use(rdfHandler());

alice.use(express.json());
bob.use(express.json());

const AGENT = namedNode("https://www.omg.org/spec/Commons/PartiesAndSituations/Agent");
const AGENT_OF = namedNode("https://www.omg.org/spec/Commons/PartiesAndSituations/actsOnBehalfOf");

alice.post('/agents', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Alice", dataset?.size);



    // return res.json({
    //     message: 'Hello from Alice'
    // });
});

alice.post('/humans', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Alice Humans", dataset);
    
    
    // return res.json({
    //     message: 'Hello from Alice'
    // });


    
});

bob.post('/agents', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Bob", dataset?.size);
    // return res.json({
    //     message: 'Hello from Bob'
    // });
});

bob.post('/humans', async (req, res) => {
    const dataset = await req.dataset?.();
    console.log("Dataset posted to Bob Humans", dataset);
    return res.json({
        message: 'Hello from Bob'
    });
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
