import express from 'express';
const app = express();
app.use(express.json());

app.post('/', async (req, res) => {
    console.log("Data posted", await req.body);
});

app.listen(3000, () => {
    console.log('Alice is listening on port 3000');
    fetch('http://localhost:3000', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify({
            message: 'Hello world',
        }),
    });
});
