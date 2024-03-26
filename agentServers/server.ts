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

const program = new Command();

program
    .option('-d, --debug', 'output extra debugging')
    .option('-s, --server', 'The URL of the interface server', 'http://localhost:3005/')
    .option('-w, --webid', 'The webId of the agent this server is representing', "http://localhost:3001/nigel")
    .option('-u, --userData', 'A path for the user data', 'sampleData/nigelSchedule.trig')
    .option('-p, --port', 'The port of the server', '3000');

program.parse(process.argv);

const options = program.opts();

const webIdString = options.webid;
const userDataPath = options.userData;
const port = parseInt(options.port);

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

app.post('/', async (req, res) => {
    const dataset = await req.dataset?.();

    console.log("Dataset posted to Alice\n", dataset?.size);

    if (!dataset) {
        return res.status(400).send('Invalid request');
    }

    const ldoDataset = createLdoDataset([...dataset]);
    const subjects = getSubjects(ldoDataset);

    try {
        const { text } = ldoDataset.usingType(UserMessageShapeType).fromSubject(webId);
        const question = 'Given the following prompt:\n' +
        '---\n' +
        `${text}\n` +
        '---\n' +
        'Please return a JSON array contaning exactly the smallest set of named graphs which are required to answer this question.\n';

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
                            text: await userDataTrig,
                            type: 'text'
                        }
                    ]
                }
            ],
        });

        console.log(text, result);
        
    } catch (e) {
        console.warn('No user message found');
    }

    return res.status(500).send('Unknown error');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})

