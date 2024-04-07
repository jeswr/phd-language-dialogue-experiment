import { generateKeyPair, exportKey, signQuads, verifyQuads, keyParams, importKey } from "@jeswr/rdfjs-sign";
import {DataFactory } from "n3";
import * as fs from 'fs';
import * as path from 'path';
import { dereferenceToStore } from "../utils";
const { namedNode, quad } = DataFactory;


generateKeyPair().then(async keyPair => {
    // console.log(keyPair.privateKey.algorithm, keyParams)
    const res = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    // const privateKEy = await crypto.subtle.importKey("jwk", {
    //     "key_ops": [
    //       "sign"
    //     ],
    //     "ext": true,
    //     "kty": "EC",
    //     "x": "kap8lFCMPrP2Z4NkO4WdcyaK7tb1vPoiooBq2cQhsPdNpo0GrCdYbCa_QRsd7Eok",
    //     "y": "rWplM5H_la6cFGS_V8I5HcvKUf1X9yo0nxmg_kjGYaf0DYUa6voDwwys9NzTctlz",
    //     "crv": "P-384",
    //     "d": "Ya7aXIqyomBnKNsycydJ2EOyaL5rh56jnEY-IRhc6AgI67ovcCSK_LaQBgEzKVpH"
    //   }, keyPair.privateKey.algorithm, true, ["sign"]);

    // const q = [
    //     quad(namedNode('https://example.com/claims'), namedNode('https://example.com/claims'), namedNode('https://example.com/claims')),
    // ]
    // const signature = await signQuads(q, privateKEy)
    // console.log(await verifyQuads(q, signature, keyPair.publicKey));

    // const pubKeyExported = await exportKey(keyPair.publicKey);
    // console.log(pubKeyExported);


    // console.log(keyPair.publicKey.algorithm, await exportKey(keyPair.publicKey))
    // fs.writeFileSync('privateKey.json', JSON.stringify(await crypto.subtle.exportKey("jwk", keyPair.privateKey), null, 2));
    // console.log(await crypto.subtle.exportKey("jwk", keyPair.privateKey))
    // console.log(await exportKey(keyPair.privateKey))
});

async function test() {
    const privateKey = await crypto.subtle.importKey("jwk", JSON.parse(fs.readFileSync(path.join(__dirname, 'sampleData', 'junKey.json')).toString()), keyParams, true, ["sign"]);
    const publicKey = await importKey("BGxATV0qAzWy4YDIqGIKbKYBbSn44eIVWzoXS6etwi995r+AeHkiT9/qqju9mAgg+BXdSqvYNuTgcNnUbBIKVXpqJPw5xtB5AknIsRV1sNU01+u1ZGGRyiNdy+Bok0jhGQ==");
    // const store = await dereferenceToStore(path.join(__dirname, 'webIds', 'jun', 'jun.ttl'));
    const q = [
        quad(namedNode('https://example.com/claims'), namedNode('https://example.com/claims'), namedNode('https://example.com/claims')),
    ]
    const signature = await signQuads(q, privateKey)
    console.log(await verifyQuads(q, signature, publicKey));
}

test()

