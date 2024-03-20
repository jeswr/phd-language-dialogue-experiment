import rdfHandler from '@rdfjs/express-handler';
import 'dotenv/config';
import express from 'express';

const alice = express();
const bob = express();

alice.use(rdfHandler());
bob.use(rdfHandler());

alice.use(express.json());
bob.use(express.json());

alice.post('/humans', async (req, res) => {

});

alice.get('/human', async (req, res) => {
    console.log("Hello from Alice");
    res.status(200).send('Hello from Alice');
});


alice.get('/', async (req, res) => {
    console.log("Hello from Alice");
    res.status(200).send('Hello from Alice');
});

alice.listen(1701, '0.0.0.0', () => {
    console.log('Alice is listening on port 1701');
});
// http://10.0.129.224:1701/human