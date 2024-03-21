import { write } from "@jeswr/pretty-turtle";
import 'dotenv/config';
import { promisifyEventEmitter } from 'event-emitter-promisify';
import { DataFactory, Store } from 'n3';
import * as path from 'path';
import * as fs from 'fs';
import dereference, { type IDereferenceOptions } from 'rdf-dereference';

// FIXME: Work out why this default thing is happening
function deref (url: string, options: IDereferenceOptions) {
    // @ts-ignore
    return dereference.default.dereference(url, options);
}

async function dereferenceToStore(file: string) {
    const store = new Store();
    return promisifyEventEmitter(store.import((await deref(file, { localFiles: true })).data), store);
}


const aliceSchedule = dereferenceToStore(path.join(process.cwd(), 'aliceSchedule.jsonld'));
const bobSchedule = dereferenceToStore(path.join(process.cwd(), 'bobSchedule.jsonld'));

const prefixes = {
    schema: 'http://schema.org/',
    ex: 'http://example.org/'
};
const bobttl = bobSchedule.then((schedule) => write([...schedule], { prefixes }));
const alicettl = aliceSchedule.then((schedule) => write([...schedule], { prefixes }));

async function main() {
    fs.writeFileSync(path.join(process.cwd(), 'aliceSchedule.ttl'), await alicettl)
    fs.writeFileSync(path.join(process.cwd(), 'bobSchedule.ttl'), await bobttl);
}

main();
