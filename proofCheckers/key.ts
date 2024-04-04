import { WebIdShape } from '../ldo/proofCheckers/webIdSignature.typings';
import { WebIdShapeShapeType } from '../ldo/proofCheckers/webIdSignature.shapeTypes';
import { dereferenceShape } from '../utils';
import { Store, DataFactory } from 'n3';
const { namedNode, defaultGraph } = DataFactory;

// Package claims
const CLAIMS = namedNode('https://example.com/claims');

// Source claims


// This should be done within the bounds of DToU requirements
function performExtractions(store: Store) {
    const claims = new Store();
    for (const { subject } of store.match(null, CLAIMS, null, defaultGraph())) {

        claims.add(quad);
    }
    return claims;
}

// This can be generalised into a proof checker that checks data is contained
// in a particular document, and that the document is signed by a particular key.
class ShapeVerifier {
    public async verifySignature(webId: WebIdShape): Promise<boolean> {
        const id = webId['@id'];
        if (typeof id !== 'string') {
            return false;
        }
        try {
            const { key } = await dereferenceShape(WebIdShapeShapeType, id);
            return key === webId.key;
        } catch (e) {
            return false;
        }
    }
}

// r; <http://www.w3.org/2000/10/swap/reason#>


// skolem:lemma3 a r:Extraction;
//     r:gives {
//         {
//             :all :got :dinner.
//         } => {
//             :all :got :dinner.
//         }.
//     };
//     r:because [ a r:Parsing; r:source <http://eyereasoner.github.io/eye/reasoning/dp/dpQ.n3>].
//     // and then DToU
