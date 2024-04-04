import { Quad } from "@rdfjs/types";
import Writer from "@shexjs/writer";
import * as fs from 'fs';
import { DataFactory, Store } from "n3";
import * as path from 'path';
import { rdf } from "rdf-namespaces";
import { parse } from 'shaclc-parse';
import { Schema } from "shexj";
const { namedNode, literal, defaultGraph, quad } = DataFactory;

const shapesDir = './shapes';

// Get all .shaclc files in the shapes directory

// https://www.w3.org/ns/shacl-shacl#ShapeShape

const shaclcFiles: string[] = fs.readdirSync(shapesDir, { recursive: true }).filter((file): file is string => typeof file === 'string' && path.extname(file) === '.shaclc');

// Convert each .shaclc file to .ttl
shaclcFiles.forEach(async file => {
    const shaclcPath = path.join(shapesDir, file);
    const shexPath = path.join(shapesDir, file.replace('.shaclc', '.shex'));

    let shapes: Quad[] & { prefixes: Record<string, string> };

    try {
      shapes = parse(fs.readFileSync(shaclcPath, 'utf8'));
    } catch (e) {
      throw new Error(`Error parsing ${shaclcPath}: ${e}`);
    }
    
    // Hacky SHACL -> SHEX
    const shapeStore = new Store(shapes);
    const shexShapes = [];
    for (const shape of shapeStore.getSubjects(rdf.type, namedNode('http://www.w3.org/ns/shacl#NodeShape'), defaultGraph())) {
        const eachOf = [];
        for (const property of shapeStore.getObjects(shape, namedNode('http://www.w3.org/ns/shacl#property'), defaultGraph())) {
            const minCount = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#minCount'), defaultGraph());
            const maxCount = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#maxCount'), defaultGraph());
            const datatype = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#datatype'), defaultGraph());
            const nodeKind = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#nodeKind'), defaultGraph());
            const pattern = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#pattern'), defaultGraph());
            const minLength = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#minLength'), defaultGraph());
            const maxLength = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#maxLength'), defaultGraph());
            const inValues = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#in'), defaultGraph());
            const hasValue = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#hasValue'), defaultGraph());
            const shapeRef = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#node'), defaultGraph());

            const path = shapeStore.getObjects(property, namedNode('http://www.w3.org/ns/shacl#path'), defaultGraph());

            if (path.length !== 1 || path[0].termType !== 'NamedNode') {
                throw new Error('Unsupported path');
            }

            let valueExpr: string | Record<string, string | string[]> = {
              "type": "NodeConstraint",
            }

            if (datatype.length === 1) {
              valueExpr.datatype = datatype[0].value;
            }
            if (nodeKind.length === 1) {
              valueExpr.nodeKind = nodeKind[0].value.split('#')[1].toLowerCase();
            }
            if (inValues.length === 1) {
              const list = shapeStore.extractLists()[inValues[0].value];
              if (list) {
                // FIXME, make this work for literals
                valueExpr.values = list.map(v => v.value);
              }
            }
            if (shapeRef.length === 1) {
              // TODO: Error if there are any other constraints
              valueExpr = shapeRef[0].value;
            }

            eachOf.push({
              "type": "TripleConstraint",
              "predicate": path[0].value,
              "valueExpr": valueExpr,
              // FIXME: Int checks etc should be done here
              "min": minCount[0]?.value ?? 0,
              "max": maxCount[0]?.value ?? -1
            })
        }
        shexShapes.push({
          "id": shape.value,
          "type": "ShapeDecl",
          "shapeExpr": {
            "type": "Shape",
            "expression": {
              "type": "EachOf",
              "expressions": eachOf
            }
          }
        })
    }

    const promise = await writeShexSchema({
      "type": "Schema",
      "shapes": shexShapes
    }, shapes.prefixes)

    fs.writeFileSync(shexPath, promise);
});

async function shaclToShexSchema() {
  
}

function writeShexSchema(schema: any, prefixes: Record<string, string>) {
    const shexWriter = new Writer({ prefixes }, {});
    return new Promise<string>((resolve, reject) => {
        shexWriter.writeSchema(
            schema,
            (error: any, text: string) => {
                if (error)
                    reject(error);
                else if (text !== undefined)
                  resolve(text);
            }
        )
    });
}
