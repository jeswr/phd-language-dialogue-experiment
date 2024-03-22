import { DatasetCore, NamedNode, BlankNode } from '@rdfjs/types';
import TermSet from '@rdfjs/term-set';

export function getSubjects(dataset: DatasetCore): TermSet<NamedNode | BlankNode> {
    const subjects = new TermSet<NamedNode | BlankNode>();

    for (const quad of dataset) {
        if (quad.subject.termType === 'NamedNode' || quad.subject.termType === 'BlankNode')
            subjects.add(quad.subject);
    }

    return subjects;
}
