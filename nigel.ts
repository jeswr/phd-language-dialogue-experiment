fetch('http://localhost:3001/agents', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        message: 'Hello from Nigel',
    }),
})
