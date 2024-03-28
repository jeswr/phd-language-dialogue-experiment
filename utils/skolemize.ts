import { DatasetCore, NamedNode } from "@rdfjs/types";
import { Store, DataFactory } from "n3";
import { v4 } from 'uuid';
import { mapTerms } from 'rdf-terms';
const { namedNode } = DataFactory;

export function skolemiseDataset(dataset: DatasetCore): DatasetCore {
    const skolemisedDataset = new Store();
    const skolemisedBlankNodes = new Map<string, NamedNode>();
    for (const quad of dataset) {
        skolemisedDataset.add(mapTerms(quad, term => {
            if (term.termType === 'BlankNode') {
                let res = skolemisedBlankNodes.get(term.value);
                if (!res) {
                    res = namedNode(`urn:uuid:${v4()}`);
                    skolemisedBlankNodes.set(term.value, res);
                }
                return res;
            }
            return term;
        }));
    }
    return skolemisedDataset;
}
