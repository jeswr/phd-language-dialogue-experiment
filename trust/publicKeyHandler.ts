import { PolicyPlugin, IPolicyType } from 'koreografeye';
import * as N3 from 'n3';
import { promisifyEventEmitter } from 'event-emitter-promisify';
import { verifyQuads } from "@jeswr/rdfjs-sign";
import { Quad } from "@rdfjs/types";
const { quad, blankNode, literal, namedNode } = N3.DataFactory;

export abstract class HookInHandler extends PolicyPlugin {   
    constructor() {
        super();
    }

    abstract run(policy: IPolicyType): Promise<N3.Quad[]>;

    async execute(mainStore: N3.Store, policyStore: N3.Store, policy: IPolicyType) {
        await promisifyEventEmitter(mainStore.removeMatches(policy.node))
        mainStore.addQuads(await this.run(policy));
        return true;
    }
}

export class PublicKeyHandler extends HookInHandler {   
    constructor(
        public readonly showMainStore: boolean,
        public readonly showPolicyStore: boolean,
        public readonly showParameters: boolean,
    ) {
        super();
    }

    async run(policy: IPolicyType) {
        const quads = policy.args['https://example.org/ns/package#content'];
        if (!quads.every((quad) => quad.termType === 'Quad')) {
            return [];
        }
        const signature = policy.args['https://example.org/ns/signature#proofValue'];
        const key = policy.args['http://www.w3.org/ns/auth/cert#key'];
        

        // verifyQuads(quads as Quad[], '', )


        console.log("PublicKeyHandler executing", policy.node, policy.args['https://example.org/ns/package#content']);
        return [quad(blankNode(), namedNode('http://example.org/hasPublicKey'), literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean')))];
    }
}

// async function getPubKey(issuer: string) {
//     const text = await fetch(issuer);
//     const data = new Store(new Parser().parse(await text.text()));
  
//     const objects = data.getObjects(namedNode(issuer), namedNode('http://www.w3.org/ns/auth/cert#key'), defaultGraph());
//     if (objects.length !== 1) {
//       throw new Error("Expected exactly one public key");
//     }
  
//     if (objects[0].termType !== 'Literal') {
//       throw new Error("Not a literal");
//     }
  
//     return importKey(objects[0].value)
//   }
// export async function validateSignatures(data: Store) {
//   for (const { subject, object, graph } of data.match(null, namedNode('https://example.org/ns/signature#hasContentSignature'), null)) {

//     const pub = await getPubKey(data.getObjects(object, namedNode('https://example.org/ns/signature#issuer'), graph)[0].value);
//     const [content] = data.getObjects(subject, 'https://example.org/ns/package#content', graph);
//     const signature = data.getObjects(object, 'https://example.org/ns/signature#proofValue', graph)[0].value;

//     const quads: Quad[] = [];

//     for (const { subject, predicate, object } of data.match(null, null, null, content)) {
//       quads.push(quad(subject, predicate, object));
//     }

//     if (await verifyDataGraph(quads, Buffer.from(signature, 'base64'), pub)) {
//       data.add(
//         quad(
//           subject,
//           namedNode('https://example.org/ns/signature#signatureHasBeenVerified'),
//           literal('true', namedNode('http://www.w3.org/2001/XMLSchema#boolean')),
//           graph
//         )
//       );
//     }
//   }
// }