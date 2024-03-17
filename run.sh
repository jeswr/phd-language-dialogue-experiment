#!/bin/bash

# JSON data
json_data='{
    "@context": {
        "name": "http://schema.org/name",
        "message": "http://schema.org/text"
    },
    "@id": "http://example.org/bob",
    "message": "Please schedule a dinner with Alice for next week."
}'

# Send POST request using cURL
curl -X POST -H "Content-Type: application/ld+json" -d "$json_data" http://localhost:3001/humans
