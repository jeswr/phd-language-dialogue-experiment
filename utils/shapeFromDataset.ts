import { LdoBase, ShapeType, createLdoDataset } from "@ldo/ldo";
import { DatasetCore, NamedNode, BlankNode } from "@rdfjs/types";
import RdfJsDb from "@shexjs/neighborhood-rdfjs";
import { ShExValidator } from "@shexjs/validator";
import { getSubjects } from "./getSubjects";
import { dereferenceToStore } from "./dereferenceToStore";

export function shapeFromDataset<T extends LdoBase>(shapeType: ShapeType<T>, dataset: DatasetCore, subject: NamedNode | BlankNode | string): T {
    const validator = new ShExValidator(shapeType.schema, (RdfJsDb as any).ctor(dataset));
    const validationResult = validator.validateShapeMap([{
        node: typeof subject === 'string' ? subject : subject.value,
        shape: shapeType.shape,
    }]);
    if (validationResult[0].status !== 'conformant') {
        throw new Error(JSON.stringify(validationResult, null, 2));
    }
    return createLdoDataset([...dataset]).usingType(shapeType).fromSubject(subject);
}

export async function dereferenceShape<T extends LdoBase>(shapeType: ShapeType<T>, source: string, subject: NamedNode | BlankNode | string = source) {
    return shapeFromDataset(shapeType, await dereferenceToStore(source), subject);
}

export function* shapeMatches<T extends LdoBase>(shapeType: ShapeType<T>, dataset: DatasetCore) {
    for (const subject of getSubjects(dataset)) {
        try {
            yield shapeFromDataset(shapeType, dataset, subject);
        } catch (e) {
            // Do nothing, not all subjects will match every shape
        }
    }
}
