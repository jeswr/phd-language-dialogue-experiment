import { LdoBase, LdoBuilder } from "@ldo/ldo";
import termSet from '@rdfjs/term-set';
import { BlankNode, NamedNode } from "@rdfjs/types";

export function* matches<T extends LdoBase>(subjects: termSet<NamedNode<string> | BlankNode>, shapeBuilder: LdoBuilder<T>) {
    for (const subject of subjects) {
        try {
            yield shapeBuilder.fromSubject(subject);
        } catch (e) {
            // Do nothing, not all subjects will match every shape
        }
    }
}
