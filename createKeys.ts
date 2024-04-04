import { generateKeyPair, exportKey, signQuads, verifyQuads } from "@jeswr/rdfjs-sign";
import {DataFactory } from "n3";
import * as fs from 'fs';
const { namedNode, quad } = DataFactory;

generateKeyPair().then(async keyPair => {
    const res = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    const privateKEy = await crypto.subtle.importKey("jwk", res, keyPair.privateKey.algorithm, true, ["sign"]);

    const q = [
        quad(namedNode('https://example.com/claims'), namedNode('https://example.com/claims'), namedNode('https://example.com/claims')),
    ]
    const signature = await signQuads(q, privateKEy)
    console.log(await verifyQuads(q, signature, keyPair.publicKey));

    // const pubKeyExported = await exportKey(keyPair.publicKey);
    // console.log(pubKeyExported);


    // console.log(keyPair.publicKey.algorithm, await exportKey(keyPair.publicKey))
    // fs.writeFileSync('privateKey.json', JSON.stringify(await crypto.subtle.exportKey("jwk", keyPair.privateKey), null, 2));
    // console.log(await crypto.subtle.exportKey("jwk", keyPair.privateKey))
    // console.log(await exportKey(keyPair.privateKey))
});
